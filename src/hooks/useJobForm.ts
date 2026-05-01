import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Job, JobStatus } from '@/types';
import { useJob, useCreateJob, useUpdateJob, jobKeys } from '@/hooks/useJobsQuery';
import { useApplicationsByJob } from '@/hooks/useApplicationsQuery';
import { jobWeightHistoryKeys } from '@/hooks/useJobWeightHistoryQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useJobAnalyzer, createJobFormData } from '@/hooks/useJobAnalyzer';
import { useJobStandardizedSkills, useSetJobSkills } from '@/hooks/useStandardizedSkillsQuery';
import { validateWeights, type MatchWeights } from '@/types/matchWeights';
import { toast } from 'sonner';

export const COMMON_BENEFITS = [
  'Vale Refeição',
  'Vale Alimentação',
  'Plano de Saúde',
  'Vale Transporte',
  'Home Office',
  'PLR',
  'Gym Pass',
  'Auxílio Creche',
  'Seguro de Vida',
];

export const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  state: '',
  city: '',
  type: '' as '' | 'remote' | 'hybrid' | 'onsite',
  level: '',
  area: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  requirements: '',
  positionsCount: '1',
  isAnonymous: false,
  weightSkillsTechnical: 25,
  weightSkillsBehavioral: 15,
  weightExperience: 30,
  weightGaugePro: 20,
  weightLocation: 10,
};

const VALID_UFS = new Set([
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]);

/**
 * Best-effort parsing of a free-text legacy location ("São Paulo, SP",
 * "São Paulo - SP", "São Paulo/SP") into structured city/state. Used
 * as fallback when editing a job whose backfill has not run yet.
 * Returns empty strings when no valid UF is detected.
 */
function parseLegacyLocation(loc: string): { city: string; state: string } {
  if (!loc) return { city: '', state: '' };
  const cleaned = loc.replace(/[/|]|\s-\s|\s+-\s+/g, ',');
  const tokens = cleaned.split(',').map((t) => t.trim()).filter(Boolean);
  let state = '';
  let city = '';
  for (const tok of tokens) {
    const upper = tok.toUpperCase();
    if (VALID_UFS.has(upper)) {
      state = upper;
    } else if (!city) {
      city = tok;
    }
  }
  return { city, state };
}

export const DESCRIPTION_LIMIT = 2000;
export const REQUIREMENTS_LIMIT = 1500;

interface UseJobFormOptions {
  jobId?: string;
  onSuccess?: () => void;
}

export function useJobForm({ jobId, onSuccess }: UseJobFormOptions = {}) {
  const navigate = useNavigate();
  const { currentCompany, user } = useAuth();
  const isEditing = !!jobId;

  // React Query hooks for CRUD
  const queryClient = useQueryClient();
  const { data: jobResult } = useJob(jobId ?? '');
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const { data: applicationsForJob } = useApplicationsByJob(jobId ?? '');

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [otherBenefits, setOtherBenefits] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  // Standardized skills state
  const [technicalSkillIds, setTechnicalSkillIds] = useState<string[]>([]);
  const [behavioralSkillIds, setBehavioralSkillIds] = useState<string[]>([]);
  const setJobSkillsMutation = useSetJobSkills();

  // Confirmation flow for weight edits on published jobs with active applications
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const originalWeightsRef = useRef<MatchWeights | null>(null);

  // Active applications: not rejected, not hired, not withdrawn
  const activeApplicationsCount = (applicationsForJob ?? [])
    .filter((a) => a.status !== 'rejected' && a.status !== 'hired' && a.status !== 'withdrawn')
    .length;

  // Load existing standardized skills when editing
  const { data: existingJobSkills } = useJobStandardizedSkills(jobId ?? '');

  // Load job for editing via React Query
  useEffect(() => {
    if (!jobId) return;
    // jobResult comes from useJob hook
    const job = jobResult?.data ?? jobResult ?? null;
    if (jobResult === null) {
      setNotFound(true);
      return;
    }
    if (!job) return; // still loading
    const loadedJob = job as Job;
    // Prefer structured city/state; fall back to parsing legacy location
    // for jobs created before the migration.
    const fallback = (!loadedJob.state || !loadedJob.city)
      ? parseLegacyLocation(loadedJob.location ?? '')
      : { city: '', state: '' };
    setFormData({
      title: loadedJob.title,
      description: loadedJob.description,
      state: loadedJob.state ?? fallback.state,
      city: loadedJob.city ?? fallback.city,
      type: loadedJob.type,
      level: loadedJob.level,
      area: loadedJob.area,
      salaryMin: loadedJob.salary.min.toString(),
      salaryMax: loadedJob.salary.max.toString(),
      salaryNegotiable: loadedJob.salary.min === 0 && loadedJob.salary.max === 0,
      requirements: loadedJob.requirements.join('\n'),
      positionsCount: (loadedJob.positionsCount ?? 1).toString(),
      isAnonymous: loadedJob.isAnonymous ?? false,
      weightSkillsTechnical: loadedJob.weightSkillsTechnical ?? 25,
      weightSkillsBehavioral: loadedJob.weightSkillsBehavioral ?? 15,
      weightExperience: loadedJob.weightExperience ?? 30,
      weightGaugePro: loadedJob.weightGaugePro ?? 20,
      weightLocation: loadedJob.weightLocation ?? 10,
    });
    // Snapshot original weights for change detection (used by confirmation gate)
    originalWeightsRef.current = {
      skillsTechnical: loadedJob.weightSkillsTechnical ?? 25,
      skillsBehavioral: loadedJob.weightSkillsBehavioral ?? 15,
      experience: loadedJob.weightExperience ?? 30,
      gaugePro: loadedJob.weightGaugePro ?? 20,
      location: loadedJob.weightLocation ?? 10,
    };
    const common = (job as Job).benefits.filter(b => COMMON_BENEFITS.includes(b));
    const other = (job as Job).benefits.filter(b => !COMMON_BENEFITS.includes(b));
    setSelectedBenefits(common);
    setOtherBenefits(other.join('\n'));
    setSkills([]);
    setJobStatus((job as Job).status);
  }, [jobId, jobResult]);

  // Populate standardized skills when editing
  useEffect(() => {
    if (!existingJobSkills || existingJobSkills.length === 0) return;
    const technical = existingJobSkills
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);
    const behavioral = existingJobSkills
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);
    setTechnicalSkillIds(technical);
    setBehavioralSkillIds(behavioral);
  }, [existingJobSkills]);

  // Mark as dirty on any change after initial load
  const updateFormData = useCallback((updates: Partial<typeof INITIAL_FORM_STATE>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Job analyzer — include custom benefits (otherBenefits) in analysis
  const jobFormData = useMemo(() => {
    const allBenefits = [
      ...selectedBenefits,
      ...otherBenefits.split('\n').filter(b => b.trim()),
    ];
    return createJobFormData(formData, allBenefits, skills, technicalSkillIds.length, behavioralSkillIds.length);
  }, [formData, selectedBenefits, otherBenefits, skills, technicalSkillIds, behavioralSkillIds]);

  const { analysis, isAnalyzing } = useJobAnalyzer(jobFormData, {
    enabled: true,
  });

  // Progress calculation
  const progress = useMemo(() => {
    let filled = 0;
    const total = 5; // title, area, location (state+city OR remote), description, requirements
    if (formData.title.trim()) filled++;
    if (formData.area) filled++;
    // Localização "preenchida" = remoto OU (estado + cidade)
    if (formData.type === 'remote' || (formData.state && formData.city)) filled++;
    if (formData.description.trim()) filled++;
    if (formData.requirements.trim()) filled++;
    return Math.round((filled / total) * 100);
  }, [formData]);

  // Validation — city/state obrigatórios apenas quando NÃO for remoto
  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Título é obrigatório';
    if (!formData.description.trim()) errors.description = 'Descrição é obrigatória';
    if (formData.type !== 'remote') {
      if (!formData.state) errors.state = 'Estado é obrigatório para vagas presenciais e híbridas';
      if (!formData.city) errors.city = 'Cidade é obrigatória para vagas presenciais e híbridas';
    }
    if (!formData.requirements.trim()) errors.requirements = 'Requisitos são obrigatórios';
    return { valid: Object.keys(errors).length === 0, errors };
  }, [formData]);

  // Toggle benefit
  const toggleBenefit = useCallback((benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    );
    setIsDirty(true);
  }, []);

  // Skills management
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill já adicionada');
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setNewSkill('');
    setIsDirty(true);
  }, [newSkill, skills]);

  const removeSkill = useCallback((skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
    setIsDirty(true);
  }, []);

  const handleSkillKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  }, [addSkill]);

  // Standardized skills handlers (mark dirty on change)
  const handleSetTechnicalSkillIds = useCallback((ids: string[]) => {
    setTechnicalSkillIds(ids);
    setIsDirty(true);
  }, []);

  const handleSetBehavioralSkillIds = useCallback((ids: string[]) => {
    setBehavioralSkillIds(ids);
    setIsDirty(true);
  }, []);

  // Apply AI suggestion
  const handleApplySuggestion = useCallback((field: string, value: string) => {
    switch (field) {
      case 'title':
        setFormData(prev => ({ ...prev, title: value }));
        break;
      case 'description':
        setFormData(prev => ({ ...prev, description: value }));
        break;
      case 'requirements':
        setFormData(prev => ({ ...prev, requirements: value }));
        break;
      case 'location': {
        // AI suggestions ainda chegam como string livre — converter para city/state
        const parsed = parseLegacyLocation(value);
        if (parsed.state) {
          setFormData(prev => ({
            ...prev,
            state: parsed.state,
            city: parsed.city || prev.city,
          }));
        }
        break;
      }
      case 'salary': {
        const salaryMatch = value.match(/R\$\s*([\d.]+)\s*-\s*R\$\s*([\d.]+)/);
        if (salaryMatch) {
          const min = salaryMatch[1].replace(/\./g, '');
          const max = salaryMatch[2].replace(/\./g, '');
          setFormData(prev => ({ ...prev, salaryMin: min, salaryMax: max, salaryNegotiable: false }));
        }
        break;
      }
      case 'benefits': {
        const suggestedBenefits = value.split(', ').map(b => b.trim());
        setSelectedBenefits(prev => {
          const newBenefits = [...prev];
          suggestedBenefits.forEach(benefit => {
            if (COMMON_BENEFITS.includes(benefit) && !newBenefits.includes(benefit)) {
              newBenefits.push(benefit);
            }
          });
          return newBenefits;
        });
        break;
      }
      default:
        break;
    }
    setIsDirty(true);
    toast.success('Sugestão aplicada!');
  }, []);

  // Update job status
  const handleUpdateStatus = useCallback((newStatus: JobStatus) => {
    if (!jobId) return;
    const messages: Record<JobStatus, string> = {
      paused: 'Vaga pausada. Ela não aparecerá mais para candidatos.',
      active: 'Vaga reativada com sucesso!',
      closed: 'Vaga encerrada. Não receberá mais candidaturas.',
    };
    updateJobMutation.mutate(
      { id: jobId, updates: { status: newStatus } },
      {
        onSuccess: () => {
          setJobStatus(newStatus);
          toast.success(messages[newStatus]);
        },
      }
    );
  }, [jobId, updateJobMutation]);

  // Detect whether the weights changed from the originally loaded snapshot
  const isWeightsChanged = useMemo(() => {
    const orig = originalWeightsRef.current;
    if (!orig) return false;
    return (
      orig.skillsTechnical !== formData.weightSkillsTechnical ||
      orig.skillsBehavioral !== formData.weightSkillsBehavioral ||
      orig.experience !== formData.weightExperience ||
      orig.gaugePro !== formData.weightGaugePro ||
      orig.location !== formData.weightLocation
    );
  }, [
    formData.weightSkillsTechnical,
    formData.weightSkillsBehavioral,
    formData.weightExperience,
    formData.weightGaugePro,
    formData.weightLocation,
  ]);

  // Whether the save flow needs to go through the double-confirmation dialog.
  // Only when editing an active job, weights actually changed, and there are
  // 1+ active applications (which would be retroactively re-scored).
  const needsWeightsConfirmation =
    isEditing
    && jobStatus === 'active'
    && isWeightsChanged
    && activeApplicationsCount > 0;

  // Confirm weight change: invokes Edge Function update-job-weights which
  // atomically updates the row, inserts a history entry and triggers
  // notifications to active candidates.
  const confirmWeightsChange = useCallback(async () => {
    if (!jobId || !user?.id) return;
    const newWeights: MatchWeights = {
      skillsTechnical: formData.weightSkillsTechnical,
      skillsBehavioral: formData.weightSkillsBehavioral,
      experience: formData.weightExperience,
      gaugePro: formData.weightGaugePro,
      location: formData.weightLocation,
    };
    const { data, error } = await supabase.functions.invoke('update-job-weights', {
      body: { jobId, performedBy: user.id, newWeights },
    });
    if (error) {
      toast.error(`Falha ao atualizar pesos: ${error.message}`);
      throw error;
    }
    // Update snapshot so a follow-up save without further weight changes
    // does not re-trigger the confirmation flow.
    originalWeightsRef.current = newWeights;
    // Invalidate caches: job detail/list, applications list, weight history.
    queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
    queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: jobWeightHistoryKeys.byJob(jobId) });
    const notified = (data as { activeApplicationsNotified?: number } | null)?.activeApplicationsNotified ?? 0;
    toast.success(
      `Pesos atualizados. ${notified} candidato${notified === 1 ? '' : 's'} notificado${notified === 1 ? '' : 's'}.`
    );
    // Não resetamos isDirty aqui: se houver outros campos editados (descrição, salário etc.),
    // o usuário ainda precisa clicar Salvar para o caminho normal persistir esses diffs.
    // Como originalWeightsRef já foi atualizado, o próximo Save não dispara o dialog de novo.
    setConfirmationOpen(false);
  }, [jobId, user?.id, formData.weightSkillsTechnical, formData.weightSkillsBehavioral, formData.weightExperience, formData.weightGaugePro, formData.weightLocation, queryClient]);

  const cancelWeightsChange = useCallback(() => {
    setConfirmationOpen(false);
  }, []);

  // Save job
  const handleSaveJob = useCallback(() => {
    const { valid } = validate();
    if (!valid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const weightsValidation = validateWeights({
      skillsTechnical: formData.weightSkillsTechnical,
      skillsBehavioral: formData.weightSkillsBehavioral,
      experience: formData.weightExperience,
      gaugePro: formData.weightGaugePro,
      location: formData.weightLocation,
    });
    if (!weightsValidation.valid) {
      toast.error(`Pesos inválidos: ${weightsValidation.error}`);
      return;
    }

    // Gate: published job + weights changed + active applications → require
    // double confirmation via dialog. The dialog's onConfirm handles the
    // weights save (Edge Function); non-weight changes will need a follow-up
    // save click after the dialog completes.
    if (needsWeightsConfirmation) {
      setConfirmationOpen(true);
      return;
    }

    const allBenefits = [
      ...selectedBenefits,
      ...otherBenefits.split('\n').filter(b => b.trim()),
    ];

    // Derive legacy location string for retrocompatibility (DB trigger also
    // syncs this, but we send a sensible value so cards/listings render
    // correctly even before the migration is applied).
    const derivedLocation = (formData.state && formData.city)
      ? `${formData.city}, ${formData.state}`
      : (formData.type === 'remote' ? 'Remoto' : '');

    const jobData: Partial<Job> = {
      title: formData.title,
      description: formData.description,
      state: formData.state || undefined,
      city: formData.city || undefined,
      location: derivedLocation,
      type: (formData.type || 'remote') as Job['type'],
      level: formData.level,
      area: formData.area,
      salary: formData.salaryNegotiable
        ? { min: 0, max: 0 }
        : { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 },
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      benefits: allBenefits,
      positionsCount: Math.max(1, parseInt(formData.positionsCount) || 1),
      isAnonymous: formData.isAnonymous,
      weightSkillsTechnical: formData.weightSkillsTechnical,
      weightSkillsBehavioral: formData.weightSkillsBehavioral,
      weightExperience: formData.weightExperience,
      weightGaugePro: formData.weightGaugePro,
      weightLocation: formData.weightLocation,
    };

    // Helper to save standardized skills after job create/update
    const saveStandardizedSkills = (targetJobId: string) => {
      const allSkills = [
        ...technicalSkillIds.map((id, i) => ({ skillId: id, priority: i + 1 })),
        ...behavioralSkillIds.map((id, i) => ({ skillId: id, priority: i + 1 })),
      ];
      if (allSkills.length > 0) {
        setJobSkillsMutation.mutate({ jobId: targetJobId, skills: allSkills });
      }
    };

    if (isEditing && jobId) {
      updateJobMutation.mutate(
        { id: jobId, updates: jobData },
        {
          onSuccess: () => {
            saveStandardizedSkills(jobId);
            toast.success('Vaga atualizada com sucesso!');
            setIsDirty(false);
            if (onSuccess) onSuccess();
            // Permanece na pagina — nao navega
          },
        }
      );
    } else {
      const newJob: Partial<Job> = {
        ...jobData,
        companyId: currentCompany?.id ?? '',
        status: 'active',
      };
      createJobMutation.mutate(newJob, {
        onSuccess: (createdJob) => {
          saveStandardizedSkills(createdJob.id);
          toast.success('Vaga publicada com sucesso!');
          setIsDirty(false);
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/empresa/vagas/${createdJob.id}/editar`);
          }
        },
      });
    }
  }, [formData, selectedBenefits, otherBenefits, skills, technicalSkillIds, behavioralSkillIds, isEditing, jobId, validate, navigate, onSuccess, createJobMutation, updateJobMutation, setJobSkillsMutation, currentCompany?.id, needsWeightsConfirmation]);

  return {
    // State
    formData,
    selectedBenefits,
    otherBenefits,
    skills,
    newSkill,
    isEditing,
    notFound,
    isDirty,
    progress,
    jobStatus,

    // Standardized skills state
    technicalSkillIds,
    behavioralSkillIds,

    // Setters
    updateFormData,
    setSelectedBenefits,
    setOtherBenefits,
    setNewSkill,

    // Match weights
    weights: {
      skillsTechnical: formData.weightSkillsTechnical,
      skillsBehavioral: formData.weightSkillsBehavioral,
      experience: formData.weightExperience,
      gaugePro: formData.weightGaugePro,
      location: formData.weightLocation,
    } as MatchWeights,
    setWeights: (w: MatchWeights) => {
      updateFormData({
        weightSkillsTechnical: w.skillsTechnical,
        weightSkillsBehavioral: w.skillsBehavioral,
        weightExperience: w.experience,
        weightGaugePro: w.gaugePro,
        weightLocation: w.location,
      });
    },

    // Handlers
    toggleBenefit,
    addSkill,
    removeSkill,
    handleSkillKeyPress,
    handleApplySuggestion,
    handleSaveJob,
    handleUpdateStatus,
    validate,

    // Standardized skills handlers
    setTechnicalSkillIds: handleSetTechnicalSkillIds,
    setBehavioralSkillIds: handleSetBehavioralSkillIds,

    // AI Analysis
    analysis,
    isAnalyzing,

    // Weight-change confirmation flow
    needsWeightsConfirmation,
    confirmationOpen,
    activeApplicationsCount,
    confirmWeightsChange,
    cancelWeightsChange,
  };
}

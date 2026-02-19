import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, JobStatus } from '@/types';
import { useJob, useCreateJob, useUpdateJob } from '@/hooks/useJobsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useJobAnalyzer, createJobFormData } from '@/hooks/useJobAnalyzer';
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
  location: '',
  type: 'remote' as 'remote' | 'hybrid' | 'onsite',
  level: '',
  area: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  requirements: '',
  positionsCount: '1',
  isAnonymous: false,
};

export const DESCRIPTION_LIMIT = 2000;
export const REQUIREMENTS_LIMIT = 1500;

interface UseJobFormOptions {
  jobId?: string;
  onSuccess?: () => void;
}

export function useJobForm({ jobId, onSuccess }: UseJobFormOptions = {}) {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const isEditing = !!jobId;

  // React Query hooks for CRUD
  const { data: jobResult } = useJob(jobId ?? '');
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [otherBenefits, setOtherBenefits] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

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
    setFormData({
      title: (job as Job).title,
      description: (job as Job).description,
      location: (job as Job).location,
      type: (job as Job).type,
      level: (job as Job).level,
      area: (job as Job).area,
      salaryMin: (job as Job).salary.min.toString(),
      salaryMax: (job as Job).salary.max.toString(),
      salaryNegotiable: (job as Job).salary.min === 0 && (job as Job).salary.max === 0,
      requirements: (job as Job).requirements.join('\n'),
      positionsCount: ((job as Job).positionsCount ?? 1).toString(),
      isAnonymous: (job as Job).isAnonymous ?? false,
    });
    const common = (job as Job).benefits.filter(b => COMMON_BENEFITS.includes(b));
    const other = (job as Job).benefits.filter(b => !COMMON_BENEFITS.includes(b));
    setSelectedBenefits(common);
    setOtherBenefits(other.join('\n'));
    setSkills([]);
    setJobStatus((job as Job).status);
  }, [jobId, jobResult]);

  // Mark as dirty on any change after initial load
  const updateFormData = useCallback((updates: Partial<typeof INITIAL_FORM_STATE>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Job analyzer
  const jobFormData = useMemo(() => {
    return createJobFormData(formData, selectedBenefits, skills);
  }, [formData, selectedBenefits, skills]);

  const { analysis, isAnalyzing } = useJobAnalyzer(jobFormData, {
    enabled: true,
  });

  // Progress calculation
  const progress = useMemo(() => {
    let filled = 0;
    const total = 5; // title, area, location, description, requirements
    if (formData.title.trim()) filled++;
    if (formData.area) filled++;
    if (formData.location.trim()) filled++;
    if (formData.description.trim()) filled++;
    if (formData.requirements.trim()) filled++;
    return Math.round((filled / total) * 100);
  }, [formData]);

  // Validation
  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Título é obrigatório';
    if (!formData.description.trim()) errors.description = 'Descrição é obrigatória';
    if (!formData.location.trim()) errors.location = 'Localização é obrigatória';
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
      case 'location':
        setFormData(prev => ({ ...prev, location: value }));
        break;
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

  // Save job
  const handleSaveJob = useCallback(() => {
    const { valid } = validate();
    if (!valid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const allBenefits = [
      ...selectedBenefits,
      ...otherBenefits.split('\n').filter(b => b.trim()),
    ];

    const jobData: Partial<Job> = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      level: formData.level,
      area: formData.area,
      salary: formData.salaryNegotiable
        ? { min: 0, max: 0 }
        : { min: parseInt(formData.salaryMin) || 0, max: parseInt(formData.salaryMax) || 0 },
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      benefits: allBenefits,
      positionsCount: Math.max(1, parseInt(formData.positionsCount) || 1),
      isAnonymous: formData.isAnonymous,
    };

    if (isEditing && jobId) {
      updateJobMutation.mutate(
        { id: jobId, updates: jobData },
        {
          onSuccess: () => {
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
  }, [formData, selectedBenefits, otherBenefits, skills, isEditing, jobId, validate, navigate, onSuccess, createJobMutation, updateJobMutation]);

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

    // Setters
    updateFormData,
    setSelectedBenefits,
    setOtherBenefits,
    setNewSkill,

    // Handlers
    toggleBenefit,
    addSkill,
    removeSkill,
    handleSkillKeyPress,
    handleApplySuggestion,
    handleSaveJob,
    handleUpdateStatus,
    validate,

    // AI Analysis
    analysis,
    isAnalyzing,
  };
}

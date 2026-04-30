/**
 * Valida o fix do calculator rodando em pares reais (candidate, job)
 * com std_skills carregadas do Supabase. Compara legacy vs novo.
 */
import { createClient } from '@supabase/supabase-js';
import { calculateMatchBreakdown } from '../src/lib/matchCalculator';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Pega 20 candidaturas mais recentes
  const { data: apps, error } = await supabase
    .from('applications')
    .select('id, candidate:candidates(*), job:jobs(*)')
    .order('applied_at', { ascending: false })
    .limit(20);

  if (error || !apps) {
    console.error('Erro carregando applications:', error);
    process.exit(1);
  }

  console.log(`app_id   | candidato            | vaga                   | LEGACY | NOVO  | Δ`);
  console.log('-'.repeat(100));

  for (const app of apps) {
    const candidate = app.candidate as any;
    const job = app.job as any;
    if (!candidate || !job) continue;

    // Carrega std_skills
    const [{ data: candStd }, { data: jobStd }] = await Promise.all([
      supabase
        .from('candidate_standardized_skills')
        .select('skill_id, priority, skill:standardized_skills(type)')
        .eq('candidate_id', candidate.id)
        .order('priority'),
      supabase
        .from('job_standardized_skills')
        .select('skill_id, priority, skill:standardized_skills(type)')
        .eq('job_id', job.id)
        .order('priority'),
    ]);

    const candTech = (candStd ?? []).filter((s: any) => s.skill?.type === 'technical').map((s: any) => s.skill_id);
    const candBeh = (candStd ?? []).filter((s: any) => s.skill?.type === 'behavioral').map((s: any) => s.skill_id);
    const jobTech = (jobStd ?? []).filter((s: any) => s.skill?.type === 'technical').map((s: any) => s.skill_id);
    const jobBeh = (jobStd ?? []).filter((s: any) => s.skill?.type === 'behavioral').map((s: any) => s.skill_id);

    const legacy = calculateMatchBreakdown(candidate, job);
    const novo = calculateMatchBreakdown(candidate, job, undefined, undefined, {
      candidateTechnical: candTech,
      candidateBehavioral: candBeh,
      jobTechnical: jobTech,
      jobBehavioral: jobBeh,
    });

    const delta = novo.totalScore - legacy.totalScore;
    const sign = delta > 0 ? '+' : '';
    const shortId = String(app.id).slice(0, 8);
    console.log(
      `${shortId} | ${candidate.name.padEnd(20).slice(0, 20)} | ${job.title.padEnd(22).slice(0, 22)} | ${String(legacy.totalScore).padStart(6)} | ${String(novo.totalScore).padStart(5)} | ${sign}${delta}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
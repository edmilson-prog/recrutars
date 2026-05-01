import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UpdateJobWeightsBody {
  jobId: string;
  performedBy: string;
  newWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body: UpdateJobWeightsBody = await req.json();
    const { jobId, performedBy, newWeights } = body;

    if (!jobId || !performedBy) {
      return jsonResponse({ error: 'jobId e performedBy são obrigatórios' }, 400);
    }

    // Validação: range 0-70 por categoria + soma=100
    const values = [
      newWeights.skillsTechnical,
      newWeights.skillsBehavioral,
      newWeights.experience,
      newWeights.gaugePro,
      newWeights.location,
    ];
    for (const v of values) {
      if (typeof v !== 'number' || v < 0 || v > 70) {
        return jsonResponse({ error: 'Cada peso deve estar entre 0 e 70' }, 400);
      }
    }
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      return jsonResponse({ error: `Soma dos pesos deve ser 100. Recebido: ${sum}` }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar pesos atuais
    const { data: currentJob, error: fetchError } = await supabase
      .from('jobs')
      .select('weight_skills_technical, weight_skills_behavioral, weight_experience, weight_gauge_pro, weight_location, company_id')
      .eq('id', jobId)
      .single();

    if (fetchError || !currentJob) {
      return jsonResponse({ error: 'Vaga não encontrada' }, 404);
    }

    const oldWeights = {
      skillsTechnical: currentJob.weight_skills_technical,
      skillsBehavioral: currentJob.weight_skills_behavioral,
      experience: currentJob.weight_experience,
      gaugePro: currentJob.weight_gauge_pro,
      location: currentJob.weight_location,
    };

    // 2. Contar candidaturas ativas (status NÃO em rejected/hired)
    const { count: activeAppsCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .not('status', 'in', '(rejected,hired)');

    const activeCount = activeAppsCount ?? 0;

    // 3. Atualizar a vaga
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        weight_skills_technical: newWeights.skillsTechnical,
        weight_skills_behavioral: newWeights.skillsBehavioral,
        weight_experience: newWeights.experience,
        weight_gauge_pro: newWeights.gaugePro,
        weight_location: newWeights.location,
      })
      .eq('id', jobId);

    if (updateError) {
      return jsonResponse({ error: `Erro ao atualizar vaga: ${updateError.message}` }, 500);
    }

    // 4. Inserir histórico (trigger gera notificações)
    const { error: historyError } = await supabase
      .from('jobs_weight_history')
      .insert({
        job_id: jobId,
        old_weights: oldWeights,
        new_weights: newWeights,
        changed_by: performedBy,
        active_applications_count: activeCount,
        reason: body.reason ?? null,
      });

    if (historyError) {
      console.error('Erro ao inserir histórico:', historyError);
      // Não retorna erro — update já foi feito; histórico é registro complementar
    }

    return jsonResponse({
      success: true,
      activeApplicationsNotified: activeCount,
      oldWeights,
      newWeights,
    });
  } catch (e) {
    console.error('Erro inesperado:', e);
    return jsonResponse({ error: 'Erro interno' }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

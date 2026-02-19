/**
 * Approve Pending Jobs — One-time data fix
 *
 * Autentica como admin e aprova todas as vagas ativas com moderation_status='pending'.
 * Necessário porque vagas foram criadas com o DEFAULT do banco ('pending') antes de
 * a lógica de auto-aprovação ser implementada no createJob().
 *
 * A RLS policy 'jobs_update_admin' permite que o usuário admin atualize qualquer vaga.
 *
 * Uso:
 *   node scripts/approve-pending-jobs.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function loadEnv() {
  try {
    const envContent = readFileSync(join(rootDir, '.env'), 'utf-8');
    const vars = {};
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      vars[key.trim()] = rest.join('=').trim();
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env['VITE_SUPABASE_ANON_KEY'];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@recrutars.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorios no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('=== Aprovando vagas pendentes ===\n');

  // 1. Autenticar como admin
  console.log(`Autenticando como ${ADMIN_EMAIL}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authError || !authData.user) {
    console.error('Falha na autenticacao:', authError?.message ?? 'usuario nao encontrado');
    process.exit(1);
  }
  console.log(`Autenticado como: ${authData.user.email}\n`);

  // 2. Verificar quantas vagas estao pendentes
  const { count: pendingCount, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')
    .eq('status', 'active');

  if (countError) {
    console.error('Erro ao contar vagas pendentes:', countError.message);
    process.exit(1);
  }

  console.log(`Vagas ativas com moderation_status='pending': ${pendingCount ?? 0}`);

  if (!pendingCount || pendingCount === 0) {
    console.log('\nNenhuma vaga pendente encontrada. Nada a fazer.');
    await supabase.auth.signOut();
    return;
  }

  // 3. Aprovar todas as vagas ativas pendentes
  console.log('\nAprovando...');
  const { data: updatedJobs, error: updateError } = await supabase
    .from('jobs')
    .update({
      moderation_status: 'approved',
      moderated_at: new Date().toISOString(),
    })
    .eq('moderation_status', 'pending')
    .eq('status', 'active')
    .select('id, title, company_id');

  if (updateError) {
    console.error('Erro ao aprovar vagas:', updateError.message);
    await supabase.auth.signOut();
    process.exit(1);
  }

  console.log(`\n✓ ${updatedJobs?.length ?? 0} vaga(s) aprovada(s):\n`);
  for (const job of updatedJobs ?? []) {
    console.log(`  - [${job.id}] ${job.title}`);
  }

  // 4. Sign out
  await supabase.auth.signOut();
  console.log('\nConcluido. As vagas agora aparecem para candidatos em "Buscar Vagas".');
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});

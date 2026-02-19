/**
 * Upload Brand Assets to Supabase Storage
 *
 * Faz upload das logos renomeadas para o bucket brand-assets/logos/
 * Autentica como admin para satisfazer a RLS policy de INSERT.
 *
 * Uso:
 *   node scripts/upload-brand-assets.mjs
 *
 * Variáveis de ambiente esperadas (em .env):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Credenciais admin (dev):
 *   ADMIN_EMAIL   (default: admin@recrutars.com)
 *   ADMIN_PASSWORD (default: Admin@123)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Carregar .env manualmente (sem depender de dotenv)
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

const LOGOS_DIR = join(rootDir, 'docs', 'images', 'logos');
const BUCKET = 'brand-assets';
const FOLDER = 'logos';

// Apenas os arquivos com nomes web-compatíveis (sem acentos/espaços)
const WEB_SAFE_PATTERN = /^[a-z0-9._-]+$/;

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Autenticar como admin
  console.log(`🔑 Autenticando como ${ADMIN_EMAIL}...`);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authError) {
    console.error('❌ Falha na autenticação:', authError.message);
    process.exit(1);
  }
  console.log('✅ Autenticado com sucesso.\n');

  // Listar arquivos web-compatíveis
  const allFiles = readdirSync(LOGOS_DIR);
  const webFiles = allFiles.filter(f => WEB_SAFE_PATTERN.test(f) && MIME_TYPES[extname(f).toLowerCase()]);

  if (webFiles.length === 0) {
    console.error('❌ Nenhum arquivo web-compatível encontrado em', LOGOS_DIR);
    process.exit(1);
  }

  console.log(`📂 Encontrados ${webFiles.length} arquivos para upload:\n`);

  const results = [];

  for (const filename of webFiles) {
    const filePath = join(LOGOS_DIR, filename);
    const storagePath = `${FOLDER}/${filename}`;
    const contentType = MIME_TYPES[extname(filename).toLowerCase()];
    const fileBuffer = readFileSync(filePath);

    process.stdout.write(`  Enviando ${filename}... `);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.log(`❌ ${error.message}`);
      results.push({ filename, ok: false, error: error.message });
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      console.log(`✅`);
      results.push({ filename, ok: true, url: data.publicUrl });
    }
  }

  console.log('\n📋 URLs públicas:\n');
  for (const r of results) {
    if (r.ok) {
      console.log(`  ${r.filename}`);
      console.log(`  → ${r.url}\n`);
    }
  }

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.error(`\n⚠️  ${failed.length} arquivo(s) com erro:`);
    for (const r of failed) console.error(`  - ${r.filename}: ${r.error}`);
    process.exit(1);
  }

  console.log(`✅ ${results.length} logos enviadas com sucesso para ${BUCKET}/${FOLDER}/`);
}

main();

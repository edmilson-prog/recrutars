/**
 * migrate-certificates-to-storage — one-off/idempotent admin migration.
 *
 * Moves legacy course certificates stored as base64 data URLs inside
 * curriculum_courses.certificate_url to the candidate-documents Storage
 * bucket, replacing the column value with the public URL. Multi-MB data URLs
 * in that column made the profile fetch (curriculums + embeds) exceed the 8s
 * statement timeout.
 *
 * Protected by a static migration key (x-migration-key header) instead of a
 * user JWT — deployed with verify_jwt=false like every other function in this
 * project. Safe to re-run: only rows still matching 'data:%' are processed
 * and uploads use upsert.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MIGRATION_KEY = 'cc86202655164449b0e50498e637b651a4f6ca43c1a342a9b7025861defcda03';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405);
  }
  if (req.headers.get('x-migration-key') !== MIGRATION_KEY) {
    return json({ error: 'unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let batchSize = 5;
  try {
    const body = await req.json();
    if (body?.batchSize) batchSize = Math.min(10, Math.max(1, Number(body.batchSize)));
  } catch {
    // empty body — keep default
  }

  const { data: rows, error: fetchError } = await supabase
    .from('curriculum_courses')
    .select('id, curriculum_id, certificate_url')
    .like('certificate_url', 'data:%')
    .limit(batchSize);

  if (fetchError) return json({ error: fetchError.message }, 500);

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const row of rows ?? []) {
    try {
      const { data: cur, error: curError } = await supabase
        .from('curriculums')
        .select('candidate_id, candidates ( profile_id )')
        .eq('id', row.curriculum_id)
        .single();
      if (curError) throw curError;

      const candidates = cur?.candidates as { profile_id?: string } | null;
      const profileId = candidates?.profile_id;
      if (!profileId) throw new Error('profile_id not found for curriculum');

      const [header, base64] = (row.certificate_url as string).split(',');
      const mime = header.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream';
      const ext =
        mime === 'application/pdf' ? 'pdf'
        : mime === 'image/png' ? 'png'
        : mime === 'image/jpeg' ? 'jpg'
        : 'bin';

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const path = `${profileId}/certificates/${row.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('candidate-documents')
        .upload(path, bytes, { upsert: true, contentType: mime });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-documents')
        .getPublicUrl(path);

      // Only replace the column value after the upload succeeded
      const { error: updateError } = await supabase
        .from('curriculum_courses')
        .update({ certificate_url: publicUrl })
        .eq('id', row.id);
      if (updateError) throw updateError;

      results.push({ id: row.id, ok: true });
    } catch (err) {
      results.push({
        id: row.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const { count } = await supabase
    .from('curriculum_courses')
    .select('id', { count: 'exact', head: true })
    .like('certificate_url', 'data:%');

  return json({
    migrated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
    remaining: count ?? -1,
  });
});

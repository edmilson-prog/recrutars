-- Add missing FK from gauge_pro_results.archetype_id to gauge_pro_archetypes.id
-- This is required for PostgREST to resolve the embedded resource join
-- used in the admin Results tab query
ALTER TABLE public.gauge_pro_results
  ADD CONSTRAINT gauge_pro_results_archetype_id_fkey
  FOREIGN KEY (archetype_id) REFERENCES public.gauge_pro_archetypes(id);

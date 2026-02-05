-- =====================================================
-- RecrutaRS: Development Users Seed
-- PRD-063: Fundacao Supabase + Autenticacao
-- =====================================================
-- IMPORTANT: Auth users must be created FIRST via Supabase Auth
-- (Dashboard > Authentication > Users > Add User) because
-- passwords are hashed by Supabase Auth, not raw SQL.
--
-- After creating auth users, the trigger auto-creates profiles.
-- Then run this script to populate companies and candidates data.
-- =====================================================

-- =====================================================
-- STEP 1: Create these users via Supabase Dashboard
-- (Authentication > Users > Add User > Create user)
-- Disable "Send email confirmation" for dev users.
--
--  Email                        | Password       | Metadata (User metadata JSON)
--  -----------------------------|----------------|-------------------------------
--  admin@recrutars.com          | Admin@123      | {"name":"Ana Silva","type":"admin"}
--  rh@techsolutions.com         | Company@123    | {"name":"Tech Solutions","type":"company"}
--  rh@inovacaodigital.com       | Company@123    | {"name":"Inovação Digital","type":"company"}
--  contato@startupbrasil.com    | Company@123    | {"name":"StartUp Brasil","type":"company"}
--  joao.santos@email.com        | Candidate@123  | {"name":"João Santos","type":"candidate"}
--  maria.oliveira@email.com     | Candidate@123  | {"name":"Maria Oliveira","type":"candidate"}
--  pedro.costa@email.com        | Candidate@123  | {"name":"Pedro Costa","type":"candidate"}
--  carla.mendes@email.com       | Candidate@123  | {"name":"Carla Mendes","type":"candidate"}
--  lucas.ferreira@email.com     | Candidate@123  | {"name":"Lucas Ferreira","type":"candidate"}
--
-- =====================================================

-- =====================================================
-- STEP 2: Update admin profile with RBAC role
-- =====================================================

UPDATE public.profiles
SET role_id = 'role-super-admin'
WHERE email = 'admin@recrutars.com';

-- =====================================================
-- STEP 3: Update company profiles with RBAC roles
-- =====================================================

UPDATE public.profiles
SET role_id = 'role-owner'
WHERE email = 'rh@techsolutions.com';

UPDATE public.profiles
SET role_id = 'role-manager'
WHERE email = 'rh@inovacaodigital.com';

UPDATE public.profiles
SET role_id = 'role-recruiter'
WHERE email = 'contato@startupbrasil.com';

-- =====================================================
-- STEP 4: Populate companies data
-- =====================================================

INSERT INTO public.companies (
  profile_id, name, cnpj, phone, industry, size, location, city, state,
  address, description, website, linkedin, plan, status, payment_status,
  active_jobs, total_candidates
)
VALUES
  (
    (SELECT id FROM public.profiles WHERE email = 'rh@techsolutions.com'),
    'Tech Solutions',
    '12.345.678/0001-90',
    '(11) 99999-9999',
    'Tecnologia',
    '51-200 funcionários',
    'São Paulo, SP',
    'São Paulo',
    'SP',
    'Av. Paulista, 1000 - Bela Vista',
    'Empresa líder em soluções de software corporativo. Desenvolvemos sistemas de gestão empresarial, plataformas de e-commerce e soluções personalizadas para empresas de todos os portes.',
    'https://techsolutions.com.br',
    'https://linkedin.com/company/techsolutions',
    'Seleção Inteligente',
    'active',
    'ok',
    5,
    127
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'rh@inovacaodigital.com'),
    'Inovação Digital',
    '98.765.432/0001-10',
    '(21) 98888-7777',
    'Marketing Digital',
    '11-50 funcionários',
    'Rio de Janeiro, RJ',
    'Rio de Janeiro',
    'RJ',
    NULL,
    'Agência especializada em transformação digital e marketing.',
    'https://inovacaodigital.com.br',
    NULL,
    'Essencial Empresas',
    'active',
    'ok',
    3,
    84
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'contato@startupbrasil.com'),
    'StartUp Brasil',
    '11.222.333/0001-44',
    '(51) 97777-6666',
    'Fintech',
    '1-10 funcionários',
    'Belo Horizonte, MG',
    'Belo Horizonte',
    'MG',
    NULL,
    'Startup inovadora no setor financeiro.',
    'https://startupbrasil.com.br',
    NULL,
    'Essencial Empresas',
    'pending',
    'pending',
    2,
    45
  )
ON CONFLICT (profile_id) DO NOTHING;

-- =====================================================
-- STEP 5: Populate candidates data
-- =====================================================

INSERT INTO public.candidates (
  profile_id, name, email, phone, title, location,
  experience_years, education, skills,
  salary_min, salary_max, availability,
  profile_completion, has_test, plan, anonymous_id, status
)
VALUES
  (
    (SELECT id FROM public.profiles WHERE email = 'joao.santos@email.com'),
    'João Santos',
    'joao.santos@email.com',
    '(11) 98765-4321',
    'Desenvolvedor Full Stack',
    'São Paulo, SP',
    5,
    'Bacharelado em Ciência da Computação',
    ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    5000, 8000,
    'Imediata',
    85, true,
    'Essencial',
    '1234',
    'active'
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'maria.oliveira@email.com'),
    'Maria Oliveira',
    'maria.oliveira@email.com',
    '(21) 97654-3210',
    'Designer UX/UI',
    'Rio de Janeiro, RJ',
    3,
    'Design Gráfico',
    ARRAY['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'UX Research'],
    4000, 6500,
    'Imediata',
    90, true,
    'Essencial',
    '2345',
    'active'
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'pedro.costa@email.com'),
    'Pedro Costa',
    'pedro.costa@email.com',
    '(51) 96543-2109',
    'Analista de Dados',
    'Porto Alegre, RS',
    4,
    'Estatística',
    ARRAY['Python', 'SQL', 'Power BI', 'Excel', 'Machine Learning'],
    5500, 8500,
    'Aviso prévio de 30 dias',
    70, false,
    'Essencial',
    '3456',
    'inactive'
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'carla.mendes@email.com'),
    'Carla Mendes',
    'carla.mendes@email.com',
    '(11) 95432-1098',
    'Gerente de Projetos',
    'São Paulo, SP',
    7,
    'Administração',
    ARRAY['Scrum', 'Agile', 'Jira', 'Gestão de Equipes', 'Comunicação'],
    7000, 10000,
    'Imediata',
    95, true,
    'Avançar',
    '4567',
    'active'
  ),
  (
    (SELECT id FROM public.profiles WHERE email = 'lucas.ferreira@email.com'),
    'Lucas Ferreira',
    'lucas.ferreira@email.com',
    '(21) 94321-0987',
    'Desenvolvedor Backend',
    'Rio de Janeiro, RJ',
    2,
    'Sistemas de Informação',
    ARRAY['Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS'],
    3500, 5500,
    'Imediata',
    60, false,
    'Essencial',
    '5678',
    'active'
  )
ON CONFLICT (profile_id) DO NOTHING;

-- =====================================================
-- Done. Verify with:
-- SELECT p.email, p.type, p.role_id FROM profiles p ORDER BY p.type;
-- SELECT c.name, c.title FROM candidates c;
-- SELECT co.name, co.plan FROM companies co;
-- =====================================================

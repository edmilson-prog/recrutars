-- ============================================================
-- Seed: Admin Settings Defaults
-- Insere valores padrão para todas as 8 categorias de configuração admin
-- Idempotente: só insere se a categoria ainda não existir
-- Fonte: src/data/settingsConfig.ts (adminSettingsCategories)
-- ============================================================

-- 1. general (Geral)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'general', NULL, '{
  "platform": {
    "platformName": "RecrutaRS",
    "platformDescription": "Plataforma de Recrutamento Inteligente",
    "supportEmail": "suporte@recrutars.com.br"
  },
  "identity": {
    "logo": "",
    "favicon": "",
    "primaryColor": "#0F172A",
    "accentColor": "#22D3EE"
  },
  "preferences": {
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "dateFormat": "DD/MM/YYYY"
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'general' AND entity_id IS NULL
);

-- 2. ai (Inteligência Artificial)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'ai', NULL, '{
  "gaugepro": {
    "gaugeproEnabled": true,
    "gaugeproVersion": "v2.0",
    "minQuestions": 20
  },
  "matching": {
    "matchingEnabled": true,
    "matchingThreshold": 60,
    "weightSkills": 40,
    "weightBehavior": 30,
    "weightExperience": 30
  },
  "behavioral": {
    "precision": "high",
    "showDetails": true
  },
  "analysisAgent": {
    "agentEnabled": true,
    "claudeModel": "claude-sonnet-4-20250514",
    "apiKey": "",
    "practicalAnalysisEnabled": true,
    "technicalAnalysisEnabled": true,
    "temperature": 0.7,
    "maxTokens": 2000
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'ai' AND entity_id IS NULL
);

-- 3. gamification (Gamificação)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'gamification', NULL, '{
  "levels": {
    "levelsEnabled": true,
    "maxLevel": 50,
    "xpMultiplier": 1.5
  },
  "achievements": {
    "achievementsEnabled": true,
    "achievementNotifications": true
  },
  "rewards": {
    "rewardsEnabled": true,
    "xpProfileComplete": 100,
    "xpTestComplete": 50,
    "xpApplication": 25
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'gamification' AND entity_id IS NULL
);

-- 4. notifications (Notificações)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'notifications', NULL, '{
  "channels": {
    "emailEnabled": true,
    "pushEnabled": true,
    "smsEnabled": false
  },
  "frequency": {
    "maxDailyNotifications": 10,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'notifications' AND entity_id IS NULL
);

-- 5. integrations (Integrações)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'integrations', NULL, '{
  "apis": {
    "linkedinEnabled": false,
    "linkedinApiKey": "",
    "googleEnabled": false
  },
  "webhooks": {
    "webhooksEnabled": false,
    "webhookUrl": "",
    "webhookSecret": ""
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'integrations' AND entity_id IS NULL
);

-- 6. users (Usuários & Permissões)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'users', NULL, '{
  "policies": {
    "minPasswordLength": 8,
    "requireUppercase": true,
    "requireNumber": true,
    "requireSpecial": false,
    "sessionTimeout": 60,
    "twoFactorRequired": false
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'users' AND entity_id IS NULL
);

-- 7. reports (Relatórios)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'reports', NULL, '{
  "metrics": {
    "dashboardRefresh": 60,
    "showRealtime": true
  },
  "exports": {
    "defaultFormat": "xlsx",
    "scheduledExportsEnabled": true
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'reports' AND entity_id IS NULL
);

-- 8. system (Sistema)
INSERT INTO system_settings (panel, category, entity_id, values, updated_by)
SELECT 'admin', 'system', NULL, '{
  "maintenance": {
    "maintenanceMode": false,
    "maintenanceMessage": "Sistema em manutenção. Voltaremos em breve."
  },
  "logs": {
    "logLevel": "info",
    "logRetentionDays": 30
  },
  "security": {
    "rateLimitEnabled": true,
    "rateLimitRequests": 100,
    "bruteForceProtection": true,
    "maxLoginAttempts": 5
  }
}'::jsonb, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM system_settings WHERE panel = 'admin' AND category = 'system' AND entity_id IS NULL
);

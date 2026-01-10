# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-01-10

### Fixed
- Removidas referências à plataforma Lovable do projeto

### Changed
- Atualizados metadados do package.json para AILA Automacao Inteligente
- Atualizado README.md com informações corretas do projeto RecrutaRS
- Removida dependência lovable-tagger do projeto
- Limpo vite.config.ts removendo plugin componentTagger
- Removidas meta tags OG/Twitter com URLs externos do index.html

## [0.1.0] - 2025-01-10

### Added
- Estrutura inicial do projeto RecrutaRS
- Landing page com seções Hero, Features, HowItWorks, CTA
- Sistema de autenticação mockado (Admin, Empresa, Candidato)
- Dashboards para cada tipo de usuário
- Componentes UI baseados em shadcn/ui
- Sistema de rotas com React Router v6

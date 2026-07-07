# Lightbox da foto do candidato (detalhes)

**Data:** 2026-07-07

## Objetivo

Na tela de detalhes do candidato, permitir que o usuário clique na foto do header para vê-la ampliada em um modal (lightbox).

## Escopo

- `src/pages/empresa/CandidateProfile.tsx` — Avatar do header (linha ~793), tela "Banco de Talentos > Detalhes"
- `src/pages/admin/CandidateDetail.tsx` — Avatar do header (linha ~478), tela equivalente do admin

Fora de escopo: avatares pequenos em listagens/cards, outras telas com foto de candidato.

## Comportamento

- Foto clicável **somente quando existe uma imagem real** (`candidate.avatar` / `mergedCandidate.avatar` preenchido). Quando cai no fallback de iniciais, não é clicável — comportamento atual permanece.
- Ao passar o mouse sobre a foto clicável: `cursor: pointer` + leve efeito de hover (opacidade/zoom sutil) para indicar que é interativa.
- Ao clicar: abre um `Dialog` (shadcn, mesmo padrão já usado no projeto) centralizado, com overlay escuro, mostrando a imagem em tamanho ampliado (`object-contain`, `max-h-[85vh]`), sem header/footer — só a imagem.
- Fecha no X padrão do Dialog, clique fora, ou Esc (comportamento nativo do componente).

## Implementação

Componente reutilizável `src/components/candidate/CandidatePhotoLightbox.tsx`:
- Props: `src?: string`, `alt: string`, `initials: string`, `className?: string` (tamanho do avatar, ex.: `w-24 h-24`)
- Encapsula `Avatar`/`AvatarImage`/`AvatarFallback` + estado do `Dialog` internamente
- Substitui o bloco `<Avatar>...</Avatar>` atual em ambas as páginas, mantendo classes de tamanho equivalentes às atuais (empresa: `w-24 h-24`; admin: `w-16 h-16`)

## Fora de escopo

- Zoom/pan dentro do lightbox, navegação entre múltiplas fotos, upload de foto.

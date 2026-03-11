# Design: Páginas Modelos e Chat IA (Pulso)

**Data:** 2026-03-11
**Status:** Aprovado

---

## Visão Geral

Implementar duas páginas do módulo Consulta:

1. `/app/(app)/consulta/modelos/page.tsx` — gerenciamento de modelos de anamnese
2. `/app/(app)/consulta/chat/page.tsx` — chat com Pulso IA (assistente médico)

---

## Estrutura de Arquivos

```
app/(app)/consulta/
  modelos/page.tsx               ← página principal (grid + busca + filtro)
  chat/page.tsx                  ← página principal (layout full-height)

components/consulta/
  ModeloCard.tsx                 ← card individual de modelo
  CriarModeloModal.tsx           ← dialog com 3 abas + preview
  ChatSidebar.tsx                ← histórico de conversas agrupado por data
  ChatInput.tsx                  ← input fixo + botão enviar
  (mensagens renderizadas inline em chat/page.tsx — sem componente separado)
```

---

## Página Modelos

### Dados
- Usa `MODELOS_PADRAO` de `lib/constants.ts` como modelos do Nuclimed (não editáveis)
- Mock de modelos personalizados do médico como estado local React

### Layout
- Header: título "Meus Modelos" + botão "Criar modelo" (violeta)
- Toolbar: campo de busca + select de especialidade (usando `ESPECIALIDADES` de constants)
- Seção "Modelos do Nuclimed": grid 3-col desktop / 2 tablet / 1 mobile
- Seção "Meus Modelos": mesma grid, cards com badge "Personalizado" (verde)

### ModeloCard
- Props: `modelo`, `tipo: "padrao" | "personalizado"`, `onUsar`, `onEditar`, `onDuplicar`, `onExcluir`
- Exibe: nome, descrição, usos (mock), última utilização (mock), badge de tipo
- Ações: "Usar" sempre disponível; "Editar" e "Excluir" apenas para personalizados; "Duplicar" para todos
- Dropdown de ações via DropdownMenu shadcn

### Modal CriarModeloModal
- Dialog shadcn, largura max-w-2xl
- Tabs (shadcn): "Criar com IA" | "A partir de exemplo" | "A partir de existente"
- **Aba "Criar com IA"**: textarea "Descreva o modelo que precisa" + botão "Gerar com IA" + chips de exemplos clicáveis
- **Aba "A partir de exemplo"**: textarea grande "Cole aqui sua anamnese" + botão "Criar modelo"
- **Aba "A partir de existente"**: lista de modelos para selecionar + textarea para ajustar
- Estado `gerando: boolean` → mostra Loader2 + texto "Gerando modelo..."
- Após geração: Preview section com nome gerado, conteúdo, botões "Usar este" | "Ajustar" | "Gerar novamente"
- Loading simulado: setTimeout 2000ms

---

## Página Chat

### Layout
- `flex h-[calc(100vh-4rem)]` para ocupar altura total descontando TopBar (h-16)
- Sidebar esquerda 240px fixa, colapsável em mobile via Sheet

### ChatSidebar
- Botão "Nova conversa" no topo (violeta)
- Lista de conversas agrupadas por data: "Hoje", "Ontem", "Esta semana", etc.
- Conversa ativa destacada com fundo violeta claro
- Mock de 5-6 conversas de exemplo

### Área Central
- Header fixo: avatar Pulso + "Pulso IA — Assistente Médico" + subtítulo "Baseado em evidências científicas" + badge "Beta"
- ChatMensagens: scroll independente (`overflow-y-auto flex-1`)
  - Bubbles usuário: alinhado à direita, fundo `bg-violet-600 text-white`, rounded-2xl
  - Bubbles IA: alinhado à esquerda, fundo `bg-slate-100`, com avatar violeta "P"
  - Timestamp em cada mensagem
- **Sugestões iniciais** (quando sem mensagens): chips clicáveis com 4 perguntas exemplo
- **Efeito digitação**: `setInterval` de 30ms adicionando caracteres à última mensagem da IA

### ChatInput
- Fixo no fundo, fundo branco com borda topo
- Textarea autoresize (1-4 linhas)
- Botão Send (violeta, desabilitado se vazio)
- Submit via Enter (Shift+Enter para nova linha)

### Aviso Legal
- Fixo abaixo do input: "As respostas são informativas e não substituem o julgamento clínico."
- Texto `text-xs text-slate-400 text-center`

### Estado Mock
- Respostas da IA: array de respostas pré-definidas rotacionadas para simular conversa real
- Delay de 600ms antes de iniciar efeito de digitação

---

## Design System

- Cor primária: `bg-violet-600` / `text-violet-600` (violeta `#6D28D9`)
- Surface: `bg-slate-50` / `bg-white`
- Sidebar bg chat: `bg-slate-900` (dark, seguindo padrão do Sidebar.tsx)
- Todos os componentes: `"use client"`, imports de `@/components/ui/*`
- Ícones: lucide-react

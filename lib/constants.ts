// ─── Cores por módulo ───────────────────────────────────────────────────────

export const CORES_MODULO = {
  consulta: "#6D28D9", // violeta
  gestao: "#0EA5E9",   // azul
  mev: "#10B981",      // verde
} as const;

// ─── Status da agenda ────────────────────────────────────────────────────────

export const STATUS_AGENDA = {
  AGENDADO: {
    label: "Agendado",
    color: "#0EA5E9",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  FINALIZADO: {
    label: "Finalizado",
    color: "#10B981",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#EF4444",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  RETORNO: {
    label: "Retorno",
    color: "#F59E0B",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  ESPERA: {
    label: "Em espera",
    color: "#F97316",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
} as const;

export type StatusAgenda = keyof typeof STATUS_AGENDA;

// ─── Pilares MEV ─────────────────────────────────────────────────────────────

export const PILARES_MEV = [
  {
    id: "movimento",
    nome: "Movimento",
    icone: "Dumbbell",
    cor: "#10B981",
    descricao: "Atividade física regular e exercícios terapêuticos adaptados ao paciente.",
  },
  {
    id: "estresse",
    nome: "Gestão do Estresse",
    icone: "Brain",
    cor: "#8B5CF6",
    descricao: "Técnicas de mindfulness, relaxamento e controle do estresse crônico.",
  },
  {
    id: "sono",
    nome: "Sono",
    icone: "Moon",
    cor: "#6366F1",
    descricao: "Higiene do sono e estratégias para melhora da qualidade e duração do sono.",
  },
  {
    id: "nutricao",
    nome: "Nutrição",
    icone: "Apple",
    cor: "#F59E0B",
    descricao: "Alimentação anti-inflamatória, equilibrada e adequada às necessidades individuais.",
  },
  {
    id: "relacionamentos",
    nome: "Relacionamentos",
    icone: "Heart",
    cor: "#EC4899",
    descricao: "Vínculos sociais saudáveis e suporte emocional como pilar da saúde.",
  },
  {
    id: "proposito",
    nome: "Propósito",
    icone: "Star",
    cor: "#F97316",
    descricao: "Sentido de vida, valores e metas que promovem bem-estar e longevidade.",
  },
] as const;

export type PilarMev = (typeof PILARES_MEV)[number];

// ─── Especialidades médicas ───────────────────────────────────────────────────

export const ESPECIALIDADES = [
  "Cardiologia",
  "Clínica Geral",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Geriatria",
  "Ginecologia e Obstetrícia",
  "Medicina do Esporte",
  "Medicina Interna",
  "Neurologia",
  "Nutrologia",
  "Oftalmologia",
  "Ortopedia e Traumatologia",
  "Otorrinolaringologia",
  "Pediatria",
  "Pneumologia",
  "Psiquiatria",
  "Reumatologia",
  "Urologia",
  "Medicina de Família e Comunidade",
] as const;

export type Especialidade = (typeof ESPECIALIDADES)[number];

// ─── Modelos padrão de consulta ───────────────────────────────────────────────

export const MODELOS_PADRAO = [
  {
    id: "anamnese-padrao",
    nome: "Anamnese Padrão",
    descricao: "Modelo completo de anamnese com queixa principal, história da doença atual, antecedentes e exame físico.",
    especialidade: null,
  },
  {
    id: "pericia-medica",
    nome: "Perícia Médica",
    descricao: "Estrutura para laudos periciais com identificação, histórico laboral, exame clínico e conclusão.",
    especialidade: null,
  },
  {
    id: "ortopedia",
    nome: "Ortopedia",
    descricao: "Avaliação ortopédica com inspeção postural, amplitude de movimento, testes especiais e diagnóstico.",
    especialidade: "Ortopedia e Traumatologia",
  },
  {
    id: "otorrino",
    nome: "Otorrinolaringologia",
    descricao: "Avaliação de ouvido, nariz e garganta com otoscopia, rinoscopia e exame da orofaringe.",
    especialidade: "Otorrinolaringologia",
  },
  {
    id: "pediatria",
    nome: "Pediatria",
    descricao: "Consulta pediátrica com desenvolvimento neuropsicomotor, vacinação e curvas de crescimento.",
    especialidade: "Pediatria",
  },
  {
    id: "pneumologia",
    nome: "Pneumologia",
    descricao: "Avaliação respiratória com espirometria, padrão ventilatório e conduta terapêutica.",
    especialidade: "Pneumologia",
  },
  {
    id: "psiquiatria",
    nome: "Psiquiatria",
    descricao: "Exame do estado mental, histórico psiquiátrico, escala de humor e plano terapêutico.",
    especialidade: "Psiquiatria",
  },
  {
    id: "reumatologia",
    nome: "Reumatologia",
    descricao: "Avaliação articular, marcadores inflamatórios, diagnóstico diferencial e conduta.",
    especialidade: "Reumatologia",
  },
  {
    id: "medicina-esporte",
    nome: "Medicina do Esporte",
    descricao: "Avaliação funcional, composição corporal, prescrição de exercício e retorno ao esporte.",
    especialidade: "Medicina do Esporte",
  },
  {
    id: "cardiologia",
    nome: "Cardiologia",
    descricao: "Avaliação cardiovascular com ausculta, ECG, fatores de risco e estratificação.",
    especialidade: "Cardiologia",
  },
  {
    id: "neurologia",
    nome: "Neurologia",
    descricao: "Exame neurológico completo com pares cranianos, força, sensibilidade e reflexos.",
    especialidade: "Neurologia",
  },
  {
    id: "ginecologia",
    nome: "Ginecologia",
    descricao: "Consulta ginecológica com histórico menstrual, exame pélvico e preventivo.",
    especialidade: "Ginecologia e Obstetrícia",
  },
] as const;

export type ModeloPadrao = (typeof MODELOS_PADRAO)[number];

// ─── Navegação da sidebar ─────────────────────────────────────────────────────

export const NAV_GRUPOS = [
  {
    label: "CONSULTA",
    cor: CORES_MODULO.consulta,
    itens: [
      { href: "/consulta/nova", label: "Nova Consulta", icone: "Mic" },
      { href: "/consulta", label: "Histórico", icone: "FileText" },
      { href: "/consulta/modelos", label: "Modelos", icone: "FileCode" },
      { href: "/consulta/chat", label: "Chat IA", icone: "MessageSquare" },
    ],
  },
  {
    label: "GESTÃO",
    cor: CORES_MODULO.gestao,
    itens: [
      { href: "/dashboard", label: "Dashboard", icone: "LayoutDashboard" },
      { href: "/agenda", label: "Agenda", icone: "Calendar" },
      { href: "/pacientes", label: "Pacientes", icone: "Users" },
      { href: "/financeiro", label: "Financeiro", icone: "DollarSign" },
      { href: "/marketing", label: "Marketing", icone: "Megaphone" },
      { href: "/estoque", label: "Estoque", icone: "Package" },
    ],
  },
  {
    label: "VIDA SAUDÁVEL",
    cor: CORES_MODULO.mev,
    itens: [
      { href: "/mev", label: "Avaliação MEV", icone: "Heart" },
      { href: "/mev/planos", label: "Planos", icone: "ClipboardList" },
    ],
  },
] as const;

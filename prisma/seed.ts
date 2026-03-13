import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do Nuclimed...");

  // ── Limpa banco ──────────────────────────────────────────────────────────
  await prisma.avaliacaoMEV.deleteMany();
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.produtoEstoque.deleteMany();
  await prisma.transacao.deleteMany();
  await prisma.mensagemChat.deleteMany();
  await prisma.consulta.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.modeloDocumento.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.medico.deleteMany();

  // ── Médico ───────────────────────────────────────────────────────────────
  const medico = await prisma.medico.create({
    data: {
      nome: "Dr. Carlos Silva",
      email: "carlos.silva@nuclimed.com.br",
      senha: "$2b$10$placeholder_hash_trocar_em_producao",
      crm: "CRM/SP 123456",
      especialidade: "Clínica Geral",
      telefone: "(11) 99999-0001",
      foto: null,
    },
  });
  console.log(`✅ Médico criado: ${medico.nome}`);

  // ── Pacientes ────────────────────────────────────────────────────────────
  const [p1, p2, p3, p4, p5, p6, p7, p8] = await Promise.all([
    prisma.paciente.create({
      data: {
        nome: "Maria Silva Pereira",
        cpf: "123.456.789-00",
        email: "maria.pereira@email.com",
        telefone: "(11) 98888-1001",
        dataNascimento: new Date("1985-03-15"),
        sexo: "FEMININO",
        estadoCivil: "CASADO",
        naturalidade: "São Paulo",
        cidade: "São Paulo",
        endereco: "Rua das Flores, 123 — Jardim Paulista",
        convenio: "Unimed",
        tipoSanguineo: "A+",
        alergias: "Dipirona",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "João Oliveira Santos",
        cpf: "234.567.890-11",
        email: "joao.santos@email.com",
        telefone: "(11) 97777-2002",
        dataNascimento: new Date("1970-07-22"),
        sexo: "MASCULINO",
        estadoCivil: "SOLTEIRO",
        naturalidade: "Campinas",
        cidade: "São Paulo",
        convenio: "SulAmérica",
        tipoSanguineo: "O-",
        alergias: "Penicilina",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Ana Ferreira Lima",
        cpf: "345.678.901-22",
        email: "ana.lima@email.com",
        telefone: "(11) 96666-3003",
        dataNascimento: new Date("1992-11-08"),
        sexo: "FEMININO",
        estadoCivil: "SOLTEIRO",
        cidade: "São Paulo",
        convenio: "Bradesco Saúde",
        tipoSanguineo: "B+",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Carlos Eduardo Mendes",
        cpf: "456.789.012-33",
        email: "carlos.mendes@email.com",
        telefone: "(11) 95555-4004",
        dataNascimento: new Date("1978-05-30"),
        sexo: "MASCULINO",
        estadoCivil: "CASADO",
        cidade: "Guarulhos",
        convenio: "Amil",
        tipoSanguineo: "AB+",
        observacoes: "Hipertensão controlada com Losartana 50mg",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Beatriz Costa Alves",
        cpf: "567.890.123-44",
        email: "beatriz.alves@email.com",
        telefone: "(11) 94444-5005",
        dataNascimento: new Date("1988-09-14"),
        sexo: "FEMININO",
        estadoCivil: "DIVORCIADO",
        cidade: "São Paulo",
        convenio: "Unimed",
        tipoSanguineo: "O+",
        alergias: "AAS",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Roberto Andrade Neto",
        cpf: "678.901.234-55",
        telefone: "(11) 93333-6006",
        dataNascimento: new Date("1960-12-01"),
        sexo: "MASCULINO",
        estadoCivil: "CASADO",
        cidade: "São Bernardo do Campo",
        tipoSanguineo: "A-",
        observacoes: "Diabético tipo 2, em uso de Metformina",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Fernanda Rocha Vieira",
        cpf: "789.012.345-66",
        email: "fernanda.vieira@email.com",
        telefone: "(11) 92222-7007",
        dataNascimento: new Date("2000-02-28"),
        sexo: "FEMININO",
        estadoCivil: "SOLTEIRO",
        cidade: "São Paulo",
        convenio: "SulAmérica",
        tipoSanguineo: "B-",
        status: "ATIVO",
        medicoId: medico.id,
      },
    }),
    prisma.paciente.create({
      data: {
        nome: "Marcos Souza Ribeiro",
        cpf: "890.123.456-77",
        telefone: "(11) 91111-8008",
        dataNascimento: new Date("1955-06-18"),
        sexo: "MASCULINO",
        estadoCivil: "CASADO",
        cidade: "Santo André",
        tipoSanguineo: "AB-",
        observacoes: "Cardiopata — uso de Atorvastatina e AAS",
        status: "INATIVO",
        medicoId: medico.id,
      },
    }),
  ]);
  console.log("✅ 8 pacientes criados");

  // ── Modelos de Documento ─────────────────────────────────────────────────
  const modelo1 = await prisma.modeloDocumento.create({
    data: {
      nome: "Consulta Geral Padrão",
      descricao: "Modelo completo para consulta clínica geral",
      conteudo: `# Consulta Clínica — {{data}}

**Paciente:** {{paciente.nome}}
**Data de Nascimento:** {{paciente.dataNascimento}}
**Convênio:** {{paciente.convenio}}

---

## Queixa Principal
{{queixaPrincipal}}

## História da Doença Atual
{{historiaDoenca}}

## Antecedentes Pessoais
{{antecedentesPessoais}}

## Exame Físico
- PA: {{pa}} mmHg
- FC: {{fc}} bpm
- Peso: {{peso}} kg | Altura: {{altura}} cm | IMC: {{imc}}

## Hipótese Diagnóstica
{{hipoteseDiagnostica}}

## Conduta
{{conduta}}

---
*Dr. {{medico.nome}} — {{medico.crm}}*`,
      especialidade: "Clínica Geral",
      padrao: true,
      usos: 47,
      medicoId: medico.id,
    },
  });
  console.log("✅ Modelos de documento criados");

  // ── Agendamentos ─────────────────────────────────────────────────────────
  const ag1 = await prisma.agendamento.create({
    data: {
      pacienteId: p1.id,
      medicoId: medico.id,
      dataHora: new Date("2026-03-13T08:00:00"),
      duracao: 30,
      tipo: "CONSULTA",
      status: "AGENDADO",
      convenio: "Unimed",
      valor: 250.0,
    },
  });
  const ag2 = await prisma.agendamento.create({
    data: {
      pacienteId: p2.id,
      medicoId: medico.id,
      dataHora: new Date("2026-03-13T09:00:00"),
      duracao: 60,
      tipo: "RETORNO",
      status: "FINALIZADO",
      convenio: "SulAmérica",
      valor: 180.0,
    },
  });
  const ag3 = await prisma.agendamento.create({
    data: {
      pacienteId: p3.id,
      medicoId: medico.id,
      dataHora: new Date("2026-03-13T10:30:00"),
      duracao: 30,
      tipo: "CONSULTA",
      status: "ESPERA",
      valor: 250.0,
    },
  });
  const ag4 = await prisma.agendamento.create({
    data: {
      pacienteId: p4.id,
      medicoId: medico.id,
      dataHora: new Date("2026-03-14T08:30:00"),
      duracao: 45,
      tipo: "PROCEDIMENTO",
      status: "AGENDADO",
      convenio: "Amil",
      valor: 350.0,
    },
  });
  await prisma.agendamento.create({
    data: {
      pacienteId: p5.id,
      medicoId: medico.id,
      dataHora: new Date("2026-03-12T14:00:00"),
      duracao: 30,
      tipo: "CONSULTA",
      status: "CANCELADO",
      convenio: "Unimed",
      valor: 250.0,
      observacoes: "Paciente desmarcou por motivo de viagem",
    },
  });
  console.log("✅ 5 agendamentos criados");

  // ── Consultas ────────────────────────────────────────────────────────────
  await prisma.consulta.create({
    data: {
      pacienteId: p2.id,
      medicoId: medico.id,
      agendamentoId: ag2.id,
      modalidade: "PRESENCIAL",
      modeloId: modelo1.id,
      duracao: 1820,
      status: "FINALIZADO",
      anamnese: JSON.stringify({
        queixaPrincipal: "Cefaleia intensa há 3 dias com piora progressiva",
        historiaDoenca: "Paciente refere dor de cabeça holocraniana, EVA 7/10, sem febre. Piora com exposição à luz. Uso prévio de Ibuprofeno sem melhora significativa.",
        antecedentesPessoais: "Hipertensão arterial sistêmica, em uso de Losartana 50mg/dia. Nega cirurgias prévias.",
        antecedentesFamiliares: "Pai com HAS e AVC isquêmico",
        medicamentosEmUso: ["Losartana 50mg 1x/dia"],
        alergias: "Penicilina",
        habitosDeVida: "Não fumante, ingesta etílica social, sedentário",
        revisaoSistemas: {
          cardiovascular: "Nega dor torácica, dispneia ou palpitações",
          respiratorio: "Nega tosse, dispneia",
          digestivo: "Náusea leve associada à cefaleia",
          neurologico: "Cefaleia holocraniana, fotofobia, sem déficits motores",
        },
        exameFisico: {
          pa: "148/92",
          fc: "78",
          fr: "16",
          temp: "36.4",
          peso: "92",
          altura: "175",
          imc: "30.0",
          glasgow: "15",
          pupilas: "Isocóricas e fotorreagentes",
          rigidezNucal: "Ausente",
        },
        hipoteseDiagnostica: "Cefaleia tensional (G44.2) — descartar cefaleia hipertensiva",
        conduta: "1. Ajuste anti-hipertensivo: Losartana 100mg/dia\n2. Analgesia: Dipirona 1g SOS\n3. Repouso com ambiente calmo e escurecido\n4. Retorno em 7 dias ou SN\n5. Solicitar: hemograma, creatinina, eletrólitos",
      }),
      transcricao:
        "Paciente João, 55 anos, retorna com queixa de cefaleia há 3 dias. Refere que a dor é intensa, piora com luz. Pressão está 148 por 92. Vou ajustar o anti-hipertensivo...",
    },
  });

  await prisma.consulta.create({
    data: {
      pacienteId: p1.id,
      medicoId: medico.id,
      modalidade: "PRESENCIAL",
      duracao: 2340,
      status: "FINALIZADO",
      anamnese: JSON.stringify({
        queixaPrincipal: "Check-up anual de rotina",
        historiaDoenca: "Paciente assintomática, vem para consulta de rotina. Última consulta há 11 meses.",
        antecedentesPessoais: "Nega comorbidades. G1P1 — parto normal 2015.",
        antecedentesFamiliares: "Mãe diabética tipo 2",
        medicamentosEmUso: ["Anticoncepcional oral"],
        alergias: "Dipirona",
        exameFisico: {
          pa: "116/74",
          fc: "68",
          fr: "14",
          temp: "36.2",
          peso: "68",
          altura: "162",
          imc: "25.9",
        },
        hipoteseDiagnostica: "Paciente saudável — risco aumentado para DM2 (histórico familiar)",
        conduta:
          "1. Solicitar: hemograma, glicemia de jejum, HbA1c, perfil lipídico, TSH, T4L\n2. Orientação nutricional: reduzir açúcares\n3. Retorno em 30 dias com exames",
      }),
    },
  });

  await prisma.consulta.create({
    data: {
      pacienteId: p6.id,
      medicoId: medico.id,
      modalidade: "PRESENCIAL",
      duracao: 1680,
      status: "FINALIZADO",
      anamnese: JSON.stringify({
        queixaPrincipal: "Controle de diabetes e pressão alta",
        historiaDoenca: "Paciente diabético tipo 2 há 8 anos, em uso de Metformina 850mg 2x/dia. Relata glicemias matinais entre 140-180 mg/dL nas últimas semanas.",
        antecedentesPessoais: "DM2, HAS. Cirurgia de apendicite (1995).",
        medicamentosEmUso: ["Metformina 850mg 2x/dia", "Enalapril 10mg 1x/dia"],
        exameFisico: {
          pa: "138/88",
          fc: "74",
          peso: "84",
          altura: "168",
          imc: "29.8",
          glicemiaCapilar: "186 mg/dL (jejum 4h)",
        },
        hipoteseDiagnostica: "DM2 descompensado — ajuste terapêutico necessário",
        conduta:
          "1. Ajuste: Metformina 1000mg 2x/dia\n2. Adicionar: Glicazida MR 30mg 1x/dia (manhã)\n3. Solicitar: HbA1c, microalbuminúria, creatinina, perfil lipídico\n4. Encaminhar nutricionista\n5. Retorno em 21 dias",
      }),
    },
  });
  console.log("✅ 3 consultas criadas");

  // ── Transações ───────────────────────────────────────────────────────────
  await prisma.transacao.createMany({
    data: [
      {
        medicoId: medico.id,
        pacienteId: p2.id,
        descricao: "Consulta de retorno — João Oliveira",
        categoria: "Consultas",
        tipo: "RECEITA",
        valor: 180.0,
        desconto: 0,
        multa: 0,
        valorLiquido: 180.0,
        formaPagamento: "CONVENIO",
        status: "PAGO",
        dataEmissao: new Date("2026-03-13"),
        dataBaixa: new Date("2026-03-13"),
      },
      {
        medicoId: medico.id,
        pacienteId: p1.id,
        descricao: "Consulta clínica geral — Maria Silva",
        categoria: "Consultas",
        tipo: "RECEITA",
        valor: 250.0,
        desconto: 25.0,
        multa: 0,
        valorLiquido: 225.0,
        formaPagamento: "PIX",
        status: "PAGO",
        dataEmissao: new Date("2026-03-11"),
        dataBaixa: new Date("2026-03-11"),
      },
      {
        medicoId: medico.id,
        pacienteId: p3.id,
        descricao: "Consulta geral — Ana Ferreira",
        categoria: "Consultas",
        tipo: "RECEITA",
        valor: 250.0,
        desconto: 0,
        multa: 0,
        valorLiquido: 250.0,
        formaPagamento: "CARTAO",
        status: "PENDENTE",
        dataEmissao: new Date("2026-03-13"),
      },
      {
        medicoId: medico.id,
        descricao: "Aluguel consultório — março/2026",
        categoria: "Infraestrutura",
        tipo: "DESPESA",
        valor: 2800.0,
        desconto: 0,
        multa: 0,
        valorLiquido: 2800.0,
        formaPagamento: "BOLETO",
        status: "PAGO",
        dataEmissao: new Date("2026-03-05"),
        dataBaixa: new Date("2026-03-07"),
      },
      {
        medicoId: medico.id,
        descricao: "Material médico — luvas, máscaras, seringas",
        categoria: "Material Médico",
        tipo: "DESPESA",
        valor: 480.0,
        desconto: 0,
        multa: 0,
        valorLiquido: 480.0,
        formaPagamento: "PIX",
        status: "PAGO",
        dataEmissao: new Date("2026-03-08"),
        dataBaixa: new Date("2026-03-08"),
      },
    ],
  });
  console.log("✅ 5 transações criadas");

  // ── Estoque ──────────────────────────────────────────────────────────────
  const prod1 = await prisma.produtoEstoque.create({
    data: {
      medicoId: medico.id,
      nome: "Dipirona 500mg",
      categoria: "Medicamentos",
      unidade: "comprimido",
      estoqueAtual: 120,
      estoqueMinimo: 50,
      validade: new Date("2027-06-30"),
    },
  });
  const prod2 = await prisma.produtoEstoque.create({
    data: {
      medicoId: medico.id,
      nome: "Luvas Descartáveis M",
      categoria: "Material de Consumo",
      unidade: "par",
      estoqueAtual: 8,
      estoqueMinimo: 30,
      validade: new Date("2026-12-31"),
    },
  });
  const prod3 = await prisma.produtoEstoque.create({
    data: {
      medicoId: medico.id,
      nome: "Álcool Gel 70%",
      categoria: "Higienização",
      unidade: "frasco 500ml",
      estoqueAtual: 0,
      estoqueMinimo: 5,
      validade: new Date("2026-04-10"),
    },
  });

  // Movimentações
  await prisma.movimentacaoEstoque.createMany({
    data: [
      {
        produtoId: prod1.id,
        tipo: "ENTRADA",
        quantidade: 200,
        responsavel: "Dr. Carlos Silva",
        observacoes: "Compra mensal — NF 4521",
        createdAt: new Date("2026-03-01"),
      },
      {
        produtoId: prod1.id,
        tipo: "SAIDA",
        quantidade: 80,
        responsavel: "Dr. Carlos Silva",
        observacoes: "Uso em consultório",
        createdAt: new Date("2026-03-10"),
      },
      {
        produtoId: prod2.id,
        tipo: "ENTRADA",
        quantidade: 50,
        responsavel: "Dr. Carlos Silva",
        observacoes: "Pedido emergencial",
        createdAt: new Date("2026-02-28"),
      },
      {
        produtoId: prod2.id,
        tipo: "SAIDA",
        quantidade: 42,
        responsavel: "Dr. Carlos Silva",
        createdAt: new Date("2026-03-12"),
      },
      {
        produtoId: prod3.id,
        tipo: "ENTRADA",
        quantidade: 10,
        responsavel: "Dr. Carlos Silva",
        createdAt: new Date("2026-01-15"),
      },
      {
        produtoId: prod3.id,
        tipo: "SAIDA",
        quantidade: 10,
        responsavel: "Dr. Carlos Silva",
        observacoes: "Estoque zerado — solicitar reposição urgente",
        createdAt: new Date("2026-03-05"),
      },
    ],
  });
  console.log("✅ 3 produtos e 6 movimentações de estoque criados");

  // ── Avaliações MEV ───────────────────────────────────────────────────────
  await prisma.avaliacaoMEV.create({
    data: {
      pacienteId: p1.id,
      medicoId: medico.id,
      peso: 68.0,
      altura: 162.0,
      imc: 25.9,
      circAbdominal: 82.0,
      comorbidades: JSON.stringify([]),
      indicadoresLab: JSON.stringify({
        insulina: "8.2",
        tgHdl: "2.1",
        vitD: "28",
        magnesio: "1.9",
        vitB12: "320",
      }),
      respostas: JSON.stringify({
        nutricao: { ultraprocessados: "Às vezes", vegetais: "Sim", agua: "Não", acucar: "Sim", fermentados: "Não" },
        atividade: { exercicio: "Não", resistencia: "Não", aerobico: "Sim", sedentario: 9 },
        sono: { horas: 6, ambiente: "Sim", telas: "Não", descansado: "Não", dificuldade: "Sim" },
        toxicos: { fuma: "Não", alcool: "Raramente", pesticidas: "Não", plastico: "Sim" },
        mental: { relaxamento: "Não", hobby: "Sim", ansiedade: "Sim", suporte: "Não" },
        social: { relacoes: "Sim", solidao: "Não", familia: "Sim", comunidade: "Não" },
      }),
      scorePilar1: 40,
      scorePilar2: 25,
      scorePilar3: 28,
      scorePilar4: 75,
      scorePilar5: 25,
      scorePilar6: 75,
      riscos: JSON.stringify([
        { pilar: "Sono", icone: "😴", score: 28, motivo: "Duração insuficiente e distúrbio do sono" },
        { pilar: "Atividade Física", icone: "🏃", score: 25, motivo: "Sedentarismo elevado e ausência de treino resistido" },
        { pilar: "Saúde Mental", icone: "🧠", score: 25, motivo: "Estresse frequente sem estratégias de manejo" },
      ]),
      planoAcao: JSON.stringify([
        { pilar: "Sono", meta: "Estabelecer rotina de sono: deitar às 22h30, evitar telas 1h antes", prazo: "30 dias", concluida: false },
        { pilar: "Atividade Física", meta: "Iniciar caminhadas 30min, 4x por semana", prazo: "15 dias", concluida: false },
        { pilar: "Saúde Mental", meta: "Praticar 10min de meditação guiada diariamente", prazo: "14 dias", concluida: false },
        { pilar: "Nutrição", meta: "Eliminar açúcar refinado das refeições principais", prazo: "2 semanas", concluida: false },
        { pilar: "Nutrição", meta: "Aumentar hidratação para 2,4L de água ao dia", prazo: "1 semana", concluida: false },
      ]),
    },
  });

  await prisma.avaliacaoMEV.create({
    data: {
      pacienteId: p4.id,
      medicoId: medico.id,
      peso: 80.0,
      altura: 178.0,
      imc: 25.2,
      circAbdominal: 94.0,
      comorbidades: JSON.stringify(["Síndrome metabólica"]),
      indicadoresLab: JSON.stringify({
        insulina: "14.5",
        tgHdl: "3.8",
        vitD: "18",
        magnesio: "1.7",
        vitB12: "210",
      }),
      respostas: JSON.stringify({
        nutricao: { ultraprocessados: "Frequentemente", vegetais: "Não", agua: "Não", acucar: "Sim", fermentados: "Não" },
        atividade: { exercicio: "Sim", resistencia: "Não", aerobico: "Sim", sedentario: 7 },
        sono: { horas: 7, ambiente: "Sim", telas: "Sim", descansado: "Sim", dificuldade: "Não" },
        toxicos: { fuma: "Não", alcool: "Semanalmente", pesticidas: "Não", plastico: "Não" },
        mental: { relaxamento: "Não", hobby: "Sim", ansiedade: "Sim", suporte: "Não" },
        social: { relacoes: "Sim", solidao: "Não", familia: "Sim", comunidade: "Não" },
      }),
      scorePilar1: 20,
      scorePilar2: 50,
      scorePilar3: 80,
      scorePilar4: 50,
      scorePilar5: 25,
      scorePilar6: 75,
      riscos: JSON.stringify([
        { pilar: "Nutrição", icone: "🥗", score: 20, motivo: "Alto consumo de ultraprocessados e baixa ingestão de vegetais" },
        { pilar: "Saúde Mental", icone: "🧠", score: 25, motivo: "Estresse frequente sem suporte psicológico" },
      ]),
      planoAcao: JSON.stringify([
        { pilar: "Nutrição", meta: "Substituir ultraprocessados por refeições integrais 5x por semana", prazo: "30 dias", concluida: false },
        { pilar: "Nutrição", meta: "Incluir 2 porções de vegetais coloridos por dia", prazo: "2 semanas", concluida: false },
        { pilar: "Saúde Mental", meta: "Agendar consulta com psicólogo — lista de encaminhamento fornecida", prazo: "15 dias", concluida: false },
        { pilar: "Controle de Tóxicos", meta: "Reduzir consumo de álcool para no máximo 1x/semana", prazo: "30 dias", concluida: false },
        { pilar: "Atividade Física", meta: "Iniciar musculação 2x/semana para resistência", prazo: "21 dias", concluida: false },
      ]),
    },
  });
  console.log("✅ 2 avaliações MEV criadas");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log(`   Médico: ${medico.nome} (${medico.email})`);
  console.log(`   Senha provisória: alterar em produção`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

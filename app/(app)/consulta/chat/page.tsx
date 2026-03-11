"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatSidebar, type Conversa } from "@/components/consulta/ChatSidebar";
import { ChatInput } from "@/components/consulta/ChatInput";
import { cn } from "@/lib/utils";

interface Mensagem {
  id: string;
  papel: "usuario" | "ia";
  conteudo: string;
  timestamp: string;
  digitando?: boolean;
}

const SUGESTOES = [
  "Qual a conduta para hipertensão estágio 2?",
  "Quais os critérios diagnósticos para diabetes tipo 2?",
  "Interações medicamentosas entre metformina e outros antidiabéticos",
  "Explique o escore de Wells para TEP",
];

const RESPOSTAS_MOCK = [
  `**Hipertensão Arterial Estágio 2** (PAS ≥ 160 ou PAD ≥ 100 mmHg)

A conduta inclui:
- **Modificações do estilo de vida** (MEV): dieta DASH, redução de sódio, atividade física regular
- **Terapia medicamentosa**: indicada imediatamente. Primeira linha: IECA/BRA + diurético tiazídico ou bloqueador de canal de cálcio
- **Meta terapêutica**: < 130/80 mmHg para a maioria dos pacientes

Referência: 7ª Diretriz Brasileira de Hipertensão Arterial (SBC, 2020).`,

  `**Critérios Diagnósticos para DM Tipo 2** (ADA/SBD):

Qualquer um dos critérios abaixo:
1. **Glicemia de jejum** ≥ 126 mg/dL (2 medições)
2. **Glicemia 2h** após TOTG ≥ 200 mg/dL
3. **HbA1c** ≥ 6,5% (método certificado)
4. **Glicemia casual** ≥ 200 mg/dL com sintomas clássicos

Nota: Na ausência de hiperglicemia sintomática, repetir o teste confirmatório.`,

  `**Interações Metformina x Antidiabéticos:**

- **Sulfonilureias**: risco de hipoglicemia (sinérgico). Monitorar glicemia.
- **Inibidores SGLT-2**: associação benéfica, baixo risco de hipoglicemia. Verificar função renal.
- **Análogos de GLP-1**: sinergia no controle glicêmico e peso. Combinação frequente.
- **Insulina**: pode potencializar efeito hipoglicemiante. Ajuste de dose necessário.
- **Contraindicação**: metformina deve ser suspensa se TFG < 30 mL/min/1,73m².`,

  `**Escore de Wells para TEP:**

| Critério | Pontos |
|---|---|
| TVP ou TEP prévios | +1,5 |
| FC > 100 bpm | +1,5 |
| Cirurgia/imobilização recente | +1,5 |
| Sinais clínicos de TVP | +3 |
| Diagnóstico alternativo menos provável | +3 |
| Hemoptise | +1 |
| Neoplasia ativa | +1 |

**Interpretação**: ≤ 4 pontos = baixa probabilidade; > 4 pontos = alta probabilidade.
D-Dímero indicado na baixa probabilidade; angiotomografia na alta.`,
];

const CONVERSAS_MOCK: Conversa[] = [
  { id: "1", titulo: "Conduta HAS estágio 2", preview: "Qual a conduta para...", data: "hoje", grupo: "Hoje" },
  { id: "2", titulo: "Critérios DM tipo 2", preview: "Quais os critérios...", data: "hoje", grupo: "Hoje" },
  { id: "3", titulo: "Escore de Wells TEP", preview: "Explique o escore...", data: "ontem", grupo: "Ontem" },
  { id: "4", titulo: "Interações metformina", preview: "Interações medicamentosas...", data: "ontem", grupo: "Ontem" },
  { id: "5", titulo: "Fibrilação atrial aguda", preview: "Conduta na FA...", data: "esta semana", grupo: "Esta semana" },
];

function agora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ConsultaChatPage() {
  const [conversas] = useState<Conversa[]>(CONVERSAS_MOCK);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [respondendo, setRespondendo] = useState(false);
  const mensagensEndRef = useRef<HTMLDivElement>(null);
  const respostaMockIdx = useRef(0);

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function novaConversa() {
    setConversaAtiva(null);
    setMensagens([]);
  }

  function selecionarConversa(id: string) {
    setConversaAtiva(id);
    setMensagens([]);
  }

  function simularDigitacao(texto: string, idMensagem: string) {
    let i = 0;
    const intervalo = setInterval(() => {
      i += 3;
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === idMensagem
            ? { ...m, conteudo: texto.substring(0, i), digitando: i < texto.length }
            : m
        )
      );
      if (i >= texto.length) {
        clearInterval(intervalo);
        setRespondendo(false);
      }
    }, 20);
  }

  function enviarMensagem() {
    if (!input.trim() || respondendo) return;

    const msgUsuario: Mensagem = {
      id: `u-${Date.now()}`,
      papel: "usuario",
      conteudo: input,
      timestamp: agora(),
    };

    const resposta = RESPOSTAS_MOCK[respostaMockIdx.current % RESPOSTAS_MOCK.length];
    respostaMockIdx.current += 1;

    const msgIA: Mensagem = {
      id: `ia-${Date.now()}`,
      papel: "ia",
      conteudo: "",
      timestamp: agora(),
      digitando: true,
    };

    setMensagens((prev) => [...prev, msgUsuario, msgIA]);
    setInput("");
    setRespondendo(true);

    setTimeout(() => simularDigitacao(resposta, msgIA.id), 600);
  }

  function usarSugestao(texto: string) {
    setInput(texto);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversas={conversas}
        conversaAtiva={conversaAtiva}
        onSelecionar={selecionarConversa}
        onNova={novaConversa}
      />

      {/* Área central */}
      <div className="flex flex-col flex-1 min-w-0 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <Avatar className="h-9 w-9 bg-violet-600">
            <AvatarFallback className="bg-violet-600 text-white font-bold text-sm">P</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-800">Pulso IA — Assistente Médico</h2>
              <Badge variant="outline" className="text-xs text-violet-700 border-violet-300 bg-violet-50">
                Beta
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Baseado em evidências científicas</p>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 max-w-xl mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-700">Como posso ajudar?</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Pergunte sobre CIDs, condutas clínicas, medicamentos e muito mais.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => usarSugestao(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-3xl",
                    msg.papel === "usuario" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  {msg.papel === "ia" && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-violet-600 text-white text-xs font-bold">P</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%]",
                      msg.papel === "usuario"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-700 rounded-tl-sm"
                    )}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.conteudo}</pre>
                    {msg.digitando && (
                      <span className="inline-flex gap-0.5 ml-1 align-middle">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                    <p className={cn(
                      "text-xs mt-1.5",
                      msg.papel === "usuario" ? "text-violet-200" : "text-slate-400"
                    )}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={mensagensEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput
          valor={input}
          onChange={setInput}
          onEnviar={enviarMensagem}
          desabilitado={respondendo}
        />
      </div>
    </div>
  );
}

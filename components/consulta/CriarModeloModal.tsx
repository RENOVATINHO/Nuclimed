"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Check, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MODELOS_PADRAO } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CriarModeloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (nome: string, conteudo: string) => void;
}

const EXEMPLOS_PROMPTS = [
  "Quero anamnese para pediatria",
  "Quero modelo de laudo de perícia",
  "Modelo para consulta de retorno em cardiologia",
  "Anamnese focada em dor crônica",
];

const PREVIEW_MOCK = `**ANAMNESE — MODELO GERADO**

**1. Identificação**
Nome: _______________ | Idade: ___ | Sexo: ___
Data: _______________ | Médico: _______________

**2. Queixa Principal (QP)**
_________________________________________________

**3. História da Doença Atual (HDA)**
Início: ___ | Duração: ___ | Intensidade: ___/10
Fatores de melhora: ___________________________
Fatores de piora: _____________________________
Sintomas associados: __________________________

**4. Antecedentes Pessoais**
[ ] HAS  [ ] DM  [ ] Cardiopatia  [ ] Outros: ___

**5. Medicamentos em uso**
_________________________________________________

**6. Alergias**
[ ] Nega  [ ] SIM: __________________________

**7. Exame Físico**
PA: ___/___  FC: ___  FR: ___  T: ___°C
SpO2: ___%  Peso: ___kg  Altura: ___m

**8. Hipótese Diagnóstica**
_________________________________________________

**9. Conduta**
_________________________________________________`;

export function CriarModeloModal({ open, onOpenChange, onSalvar }: CriarModeloModalProps) {
  const [abaAtiva, setAbaAtiva] = useState("ia");
  const [promptIA, setPromptIA] = useState("");
  const [conteudoExemplo, setConteudoExemplo] = useState("");
  const [modeloBase, setModeloBase] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [nomeGerado, setNomeGerado] = useState("");

  function simularGeracao(nome: string) {
    setGerando(true);
    setPreview(null);
    setTimeout(() => {
      setGerando(false);
      setNomeGerado(nome || "Modelo Personalizado");
      setPreview(PREVIEW_MOCK);
    }, 2000);
  }

  function handleGerarComIA() {
    if (!promptIA.trim()) return;
    simularGeracao(promptIA.split(" ").slice(-3).join(" "));
  }

  function handleCriarDeExemplo() {
    if (!conteudoExemplo.trim()) return;
    simularGeracao("Modelo do Exemplo");
  }

  function handleCriarDeExistente() {
    if (!modeloBase) return;
    const base = MODELOS_PADRAO.find((m) => m.id === modeloBase);
    simularGeracao(base ? `Baseado em ${base.nome}` : "Modelo Personalizado");
  }

  function handleUsarEste() {
    if (!preview) return;
    onSalvar(nomeGerado, preview);
    onOpenChange(false);
    resetar();
  }

  function resetar() {
    setPromptIA("");
    setConteudoExemplo("");
    setModeloBase(null);
    setPreview(null);
    setGerando(false);
    setNomeGerado("");
    setAbaAtiva("ia");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetar(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Criar Novo Modelo
          </DialogTitle>
        </DialogHeader>

        {!preview && !gerando && (
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="ia" className="flex-1 text-xs sm:text-sm">Criar com IA</TabsTrigger>
              <TabsTrigger value="exemplo" className="flex-1 text-xs sm:text-sm">A partir de exemplo</TabsTrigger>
              <TabsTrigger value="existente" className="flex-1 text-xs sm:text-sm">A partir de existente</TabsTrigger>
            </TabsList>

            {/* ABA: Criar com IA */}
            <TabsContent value="ia" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Descreva o modelo que precisa
                </label>
                <Textarea
                  placeholder="Ex: Quero uma anamnese completa para consulta pediátrica com seção de desenvolvimento neuromotor..."
                  className="min-h-[100px] resize-none"
                  value={promptIA}
                  onChange={(e) => setPromptIA(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Exemplos:</p>
                <div className="flex flex-wrap gap-2">
                  {EXEMPLOS_PROMPTS.map((exemplo) => (
                    <button
                      key={exemplo}
                      type="button"
                      onClick={() => setPromptIA(exemplo)}
                      className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      {exemplo}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleGerarComIA}
                disabled={!promptIA.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
            </TabsContent>

            {/* ABA: A partir de exemplo */}
            <TabsContent value="exemplo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Cole aqui sua anamnese ou exemplo
                </label>
                <Textarea
                  placeholder="Cole aqui o texto da sua anamnese, laudo ou qualquer modelo que deseja usar como base..."
                  className="min-h-[180px] resize-none font-mono text-xs"
                  value={conteudoExemplo}
                  onChange={(e) => setConteudoExemplo(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCriarDeExemplo}
                disabled={!conteudoExemplo.trim()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar modelo
              </Button>
            </TabsContent>

            {/* ABA: A partir de existente */}
            <TabsContent value="existente" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Selecione um modelo como base
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {MODELOS_PADRAO.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModeloBase(m.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                        modeloBase === m.id
                          ? "border-violet-400 bg-violet-50 text-violet-800"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.nome}</span>
                        {modeloBase === m.id && <Check className="h-4 w-4 text-violet-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.descricao}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCriarDeExistente}
                disabled={!modeloBase}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Usar como base
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Estado: Gerando */}
        {gerando && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-violet-600" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-violet-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-700">Gerando modelo...</p>
              <p className="text-sm text-slate-400 mt-1">A IA está criando seu modelo personalizado</p>
            </div>
          </div>
        )}

        {/* Preview do modelo gerado */}
        {preview && !gerando && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-slate-700">Modelo gerado: <span className="text-violet-700">{nomeGerado}</span></span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                {preview}
              </pre>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleUsarEste}
              >
                <Check className="h-4 w-4 mr-2" />
                Usar este
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setPreview(null); }}
              >
                Ajustar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => simularGeracao(nomeGerado)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar novamente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  // Dados pessoais
  nomeCompleto: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)"),
  dataNasc: z.string().min(1, "Data de nascimento obrigatória"),
  sexo: z.string().min(1, "Sexo obrigatório"),
  estadoCivil: z.string().optional(),
  naturalidade: z.string().optional(),
  // Contato
  telefoneCelular: z
    .string()
    .min(10, "Telefone obrigatório")
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido (ex: (11) 99999-9999)"),
  email: z.string().email("Email inválido"),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1, "Cidade obrigatória"),
  estado: z.string().min(2, "Estado obrigatório"),
  cep: z.string().optional(),
  // Saúde
  tipoSanguineo: z.string().optional(),
  alergias: z.string().optional(),
  convenio: z.string().optional(),
  numeroCarteirinha: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface NovoPacienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Etapas ───────────────────────────────────────────────────────────────────

const ETAPAS = [
  { id: 0, label: "Dados Pessoais", icon: User },
  { id: 1, label: "Contato", icon: Phone },
  { id: 2, label: "Saúde", icon: Heart },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export function NovoPacienteModal({ open, onOpenChange }: NovoPacienteModalProps) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sexo: "",
      estadoCivil: "",
      tipoSanguineo: "",
      convenio: "",
    },
  });

  // Campos por etapa para validação parcial
  const CAMPOS_POR_ETAPA: (keyof FormData)[][] = [
    ["nomeCompleto", "cpf", "dataNasc", "sexo"],
    ["telefoneCelular", "email", "cidade", "estado"],
    [],
  ];

  async function avancar() {
    const valido = await trigger(CAMPOS_POR_ETAPA[etapa]);
    if (valido) setEtapa((e) => Math.min(2, e + 1));
  }

  function voltar() {
    setEtapa((e) => Math.max(0, e - 1));
  }

  function fechar() {
    reset();
    setEtapa(0);
    onOpenChange(false);
  }

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      // TODO: chamar POST /api/pacientes com os dados
      await new Promise((r) => setTimeout(r, 800)); // simula latência
      const novoId = `p${Date.now()}`;
      fechar();
      router.push(`/pacientes/${novoId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatarCPF(val: string) {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    return nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatarTelefone(val: string) {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 10)
      return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>

        {/* Indicador de etapas */}
        <div className="flex items-center gap-0 mt-1 mb-6">
          {ETAPAS.map((e, i) => {
            const Icon = e.icon;
            const ativo = etapa === i;
            const concluido = etapa > i;
            return (
              <div key={e.id} className="flex items-center flex-1">
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors text-xs font-semibold",
                      concluido
                        ? "border-violet-600 bg-violet-600 text-white"
                        : ativo
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    )}
                  >
                    {concluido ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      ativo ? "text-violet-700" : concluido ? "text-violet-500" : "text-slate-400"
                    )}
                  >
                    {e.label}
                  </span>
                </div>
                {i < ETAPAS.length - 1 && (
                  <div
                    className={cn(
                      "mb-5 h-px flex-1 max-w-[40px] transition-colors",
                      etapa > i ? "bg-violet-400" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── ETAPA 0 — Dados Pessoais ─────────────────────────────────────── */}
          {etapa === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nomeCompleto">Nome completo *</Label>
                <Input
                  id="nomeCompleto"
                  placeholder="Maria das Graças Silva"
                  {...register("nomeCompleto")}
                />
                {errors.nomeCompleto && (
                  <p className="text-xs text-red-500">{errors.nomeCompleto.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                    onChange={(e) => setValue("cpf", formatarCPF(e.target.value))}
                  />
                  {errors.cpf && (
                    <p className="text-xs text-red-500">{errors.cpf.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dataNasc">Data de nascimento *</Label>
                  <Input
                    id="dataNasc"
                    type="date"
                    {...register("dataNasc")}
                  />
                  {errors.dataNasc && (
                    <p className="text-xs text-red-500">{errors.dataNasc.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sexo *</Label>
                  <Select onValueChange={(v) => setValue("sexo", v)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Não informado">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sexo && (
                    <p className="text-xs text-red-500">{errors.sexo.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Estado civil</Label>
                  <Select onValueChange={(v) => setValue("estadoCivil", v)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="União estável">União estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  placeholder="São Paulo - SP"
                  {...register("naturalidade")}
                />
              </div>
            </div>
          )}

          {/* ── ETAPA 1 — Contato ────────────────────────────────────────────── */}
          {etapa === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="telefoneCelular">Telefone celular *</Label>
                  <Input
                    id="telefoneCelular"
                    placeholder="(11) 99999-9999"
                    {...register("telefoneCelular")}
                    onChange={(e) => setValue("telefoneCelular", formatarTelefone(e.target.value))}
                  />
                  {errors.telefoneCelular && (
                    <p className="text-xs text-red-500">{errors.telefoneCelular.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="paciente@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    placeholder="Rua das Flores"
                    {...register("logradouro")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" placeholder="123" {...register("numero")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" placeholder="Centro" {...register("bairro")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" {...register("cep")} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    placeholder="São Paulo"
                    {...register("cidade")}
                  />
                  {errors.cidade && (
                    <p className="text-xs text-red-500">{errors.cidade.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    placeholder="SP"
                    maxLength={2}
                    className="uppercase"
                    {...register("estado")}
                    onChange={(e) => setValue("estado", e.target.value.toUpperCase())}
                  />
                  {errors.estado && (
                    <p className="text-xs text-red-500">{errors.estado.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ETAPA 2 — Saúde ─────────────────────────────────────────────── */}
          {etapa === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tipo sanguíneo</Label>
                  <Select onValueChange={(v) => setValue("tipoSanguineo", v)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Não sabe"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Convênio</Label>
                  <Select onValueChange={(v) => setValue("convenio", v)} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Particular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Particular">Particular</SelectItem>
                      <SelectItem value="Unimed">Unimed</SelectItem>
                      <SelectItem value="Bradesco Saúde">Bradesco Saúde</SelectItem>
                      <SelectItem value="Amil">Amil</SelectItem>
                      <SelectItem value="SulAmérica">SulAmérica</SelectItem>
                      <SelectItem value="Porto Seguro">Porto Seguro</SelectItem>
                      <SelectItem value="NotreDame Intermédica">NotreDame Intermédica</SelectItem>
                      <SelectItem value="Hapvida">Hapvida</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="numeroCarteirinha">Número da carteirinha</Label>
                <Input
                  id="numeroCarteirinha"
                  placeholder="0000000000000"
                  {...register("numeroCarteirinha")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alergias">Alergias conhecidas</Label>
                <Textarea
                  id="alergias"
                  placeholder="Ex: Dipirona, Penicilina, látex..."
                  rows={3}
                  {...register("alergias")}
                />
                <p className="text-xs text-muted-foreground">
                  Liste as alergias separadas por vírgula.
                </p>
              </div>
            </div>
          )}

          {/* ── Botões de navegação ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={etapa === 0 ? fechar : voltar}
              className="gap-1.5"
            >
              {etapa > 0 && <ChevronLeft className="h-4 w-4" />}
              {etapa === 0 ? "Cancelar" : "Voltar"}
            </Button>

            {etapa < 2 ? (
              <Button
                type="button"
                onClick={avancar}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                {isSubmitting ? "Salvando..." : "Cadastrar paciente"}
                {!isSubmitting && <Check className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

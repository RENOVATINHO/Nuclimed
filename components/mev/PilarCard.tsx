import { cn } from "@/lib/utils";

interface PilarCardProps {
  nome: string;
  icone: string;
  score: number;
  atencao: string;
  corBg: string;
  corTexto: string;
}

function getClassificacao(score: number) {
  if (score <= 40)
    return { label: "Crítico", badgeCn: "bg-red-100 text-red-700", barCn: "bg-red-500" };
  if (score <= 70)
    return { label: "Moderado", badgeCn: "bg-amber-100 text-amber-700", barCn: "bg-amber-500" };
  return { label: "Ideal", badgeCn: "bg-emerald-100 text-emerald-700", barCn: "bg-emerald-500" };
}

export default function PilarCard({ nome, icone, score, atencao, corBg, corTexto }: PilarCardProps) {
  const { label, badgeCn, barCn } = getClassificacao(score);

  return (
    <div className={cn("rounded-xl border p-4", corBg)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icone}</span>
          <span className={cn("font-semibold text-sm", corTexto)}>{nome}</span>
        </div>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", badgeCn)}>
          {label}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Score</span>
          <span className="font-bold text-slate-700">{score}%</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barCn)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{atencao}</p>
    </div>
  );
}

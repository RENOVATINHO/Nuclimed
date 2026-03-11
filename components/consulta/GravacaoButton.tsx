"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EstadoGravacao = "parado" | "gravando" | "processando";

export function formatarTempo(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

interface GravacaoButtonProps {
  estado: EstadoGravacao;
  tempoSegundos: number;
  onIniciar: () => void;
  onParar: () => void;
  className?: string;
}

export function GravacaoButton({
  estado,
  tempoSegundos,
  onIniciar,
  onParar,
  className,
}: GravacaoButtonProps) {
  const isGravando = estado === "gravando";
  const isProcessando = estado === "processando";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Botão circular */}
      <div className="relative flex items-center justify-center">
        {/* Anel externo pulsante */}
        {isGravando && (
          <>
            <span
              className="absolute h-32 w-32 rounded-full bg-red-400/20 animate-ping"
              style={{ animationDuration: "1.4s" }}
            />
            <span className="absolute h-28 w-28 rounded-full bg-red-100 animate-pulse" />
          </>
        )}

        <button
          type="button"
          onClick={isGravando ? onParar : !isProcessando ? onIniciar : undefined}
          disabled={isProcessando}
          aria-label={
            isProcessando ? "Processando" : isGravando ? "Parar gravação" : "Iniciar gravação"
          }
          className={cn(
            "relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-md transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-4",
            isProcessando &&
              "bg-violet-600 text-white focus-visible:ring-violet-300 cursor-not-allowed",
            isGravando &&
              "bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-red-200/60 focus-visible:ring-red-300",
            !isGravando &&
              !isProcessando &&
              "bg-white border-2 border-slate-200 hover:border-violet-300 text-slate-400 hover:text-violet-600 focus-visible:ring-violet-200"
          )}
        >
          {isProcessando ? (
            <Loader2 className="h-9 w-9 animate-spin" />
          ) : isGravando ? (
            <MicOff className="h-9 w-9" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </button>
      </div>

      {/* Timer — só aparece quando gravando */}
      <div className="h-8 flex items-center justify-center">
        {isGravando && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-2xl font-bold tabular-nums text-red-600 leading-none">
              {formatarTempo(tempoSegundos)}
            </span>
          </div>
        )}
      </div>

      {/* Label de status */}
      <p
        className={cn(
          "text-sm font-medium text-center leading-tight",
          isProcessando && "text-violet-600",
          isGravando && "text-red-600",
          !isGravando && !isProcessando && "text-slate-400"
        )}
      >
        {isProcessando
          ? "IA processando sua consulta..."
          : isGravando
          ? "Gravando… clique para parar"
          : "Iniciar gravação"}
      </p>
    </div>
  );
}

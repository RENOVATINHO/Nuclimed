"use client";

import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  valor: string;
  onChange: (v: string) => void;
  onEnviar: () => void;
  desabilitado?: boolean;
}

export function ChatInput({ valor, onChange, onEnviar, desabilitado }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (valor.trim() && !desabilitado) onEnviar();
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <Textarea
          ref={ref}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre CID, condutas, medicações..."
          className="min-h-[44px] max-h-[120px] resize-none flex-1 text-sm"
          disabled={desabilitado}
          rows={1}
        />
        <Button
          size="icon"
          className={cn(
            "h-11 w-11 flex-shrink-0 transition-colors",
            valor.trim() && !desabilitado
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
          onClick={() => { if (valor.trim() && !desabilitado) onEnviar(); }}
          disabled={!valor.trim() || desabilitado}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-slate-400 text-center mt-2 max-w-4xl mx-auto">
        As respostas são informativas e não substituem o julgamento clínico.
      </p>
    </div>
  );
}

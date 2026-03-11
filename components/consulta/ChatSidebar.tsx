"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Conversa {
  id: string;
  titulo: string;
  preview: string;
  data: string;
  grupo: string;
}

interface ChatSidebarProps {
  conversas: Conversa[];
  conversaAtiva: string | null;
  onSelecionar: (id: string) => void;
  onNova: () => void;
}

export function ChatSidebar({ conversas, conversaAtiva, onSelecionar, onNova }: ChatSidebarProps) {
  const grupos = Array.from(new Set(conversas.map((c) => c.grupo)));

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-700 h-full">
      <div className="p-3">
        <Button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          onClick={onNova}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova conversa
        </Button>
      </div>

      <Separator className="bg-slate-700" />

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {grupos.map((grupo) => (
          <div key={grupo}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1">
              {grupo}
            </p>
            <div className="space-y-0.5">
              {conversas
                .filter((c) => c.grupo === grupo)
                .map((conversa) => (
                  <button
                    key={conversa.id}
                    type="button"
                    onClick={() => onSelecionar(conversa.id)}
                    className={cn(
                      "w-full text-left px-2 py-2 rounded-lg transition-colors group",
                      conversaAtiva === conversa.id
                        ? "bg-violet-700/40 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate leading-tight">
                          {conversa.titulo}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5 group-hover:text-slate-400">
                          {conversa.preview}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

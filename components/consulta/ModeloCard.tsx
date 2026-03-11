"use client";

import { MoreVertical, Play, Copy, Pencil, Trash2, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ModeloItem {
  id: string;
  nome: string;
  descricao: string;
  especialidade: string | null;
  usos: number;
  ultimaUtilizacao: string | null;
  tipo: "padrao" | "personalizado";
}

interface ModeloCardProps {
  modelo: ModeloItem;
  onUsar: (id: string) => void;
  onEditar?: (id: string) => void;
  onDuplicar: (id: string) => void;
  onExcluir?: (id: string) => void;
}

export function ModeloCard({ modelo, onUsar, onEditar, onDuplicar, onExcluir }: ModeloCardProps) {
  const isPersonalizado = modelo.tipo === "personalizado";

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                {modelo.nome}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPersonalizado ? (
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-xs">
                  Personalizado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-violet-700 border-violet-300 bg-violet-50 text-xs">
                  Nuclimed
                </Badge>
              )}
              {modelo.especialidade && (
                <Badge variant="secondary" className="text-xs">
                  {modelo.especialidade}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onUsar(modelo.id)}>
                <Play className="h-4 w-4 mr-2 text-violet-600" />
                Usar modelo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicar(modelo.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              {isPersonalizado && onEditar && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEditar(modelo.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </>
              )}
              {isPersonalizado && onExcluir && (
                <DropdownMenuItem
                  onClick={() => onExcluir(modelo.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {modelo.descricao}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {modelo.usos} {modelo.usos === 1 ? "uso" : "usos"}
          </span>
          {modelo.ultimaUtilizacao && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {modelo.ultimaUtilizacao}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-1"
          onClick={() => onUsar(modelo.id)}
        >
          <Play className="h-3.5 w-3.5 mr-1.5" />
          Usar modelo
        </Button>
      </CardContent>
    </Card>
  );
}

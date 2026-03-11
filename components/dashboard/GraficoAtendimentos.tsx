"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface DiaAtendimento {
  dia: string;       // "01/03", "02/03" …
  realizados: number;
  cancelados: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-600">
            {p.name === "realizados" ? "Realizados" : "Cancelados"}:{" "}
            <strong>{p.value}</strong>
          </span>
        </div>
      ))}
      <div className="mt-1 border-t pt-1 text-slate-500">
        Total: <strong>{total}</strong>
      </div>
    </div>
  );
}

export function GraficoAtendimentos({ data }: { data: DiaAtendimento[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={10} barGap={2}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) =>
            value === "realizados" ? "Realizados" : "Cancelados"
          }
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        <Bar
          dataKey="realizados"
          fill="#10B981"
          radius={[4, 4, 0, 0]}
          name="realizados"
        />
        <Bar
          dataKey="cancelados"
          fill="#EF4444"
          radius={[4, 4, 0, 0]}
          name="cancelados"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

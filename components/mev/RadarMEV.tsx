"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface PilarScore {
  pilar: string;
  score: number;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 rounded-lg px-3 py-2 text-white text-xs shadow-xl">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-emerald-400 font-bold text-base">{payload[0].value}%</p>
    </div>
  );
}

interface RadarMEVProps {
  scores: PilarScore[];
}

export default function RadarMEV({ scores }: RadarMEVProps) {
  const data = scores.map((s) => ({ pilar: s.pilar, score: s.score }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart cx="50%" cy="50%" outerRadius={110} data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="pilar"
          tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false}
          axisLine={false}
          tickCount={5}
        />
        <Radar
          name="Score MEV"
          dataKey="score"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.28}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

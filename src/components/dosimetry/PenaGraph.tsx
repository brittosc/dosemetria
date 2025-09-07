"use client";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPena } from "@/lib/calculations";

export function PenaGraph() {
  const { state } = useDosimetryCalculator();
  const data = state.crimes.map((crime, index) => ({
    name: `Crime ${index + 1}`,
    "Pena Base": crime.penaPrimeiraFase,
    "Pena Provisória": crime.penaProvisoria,
    "Pena Definitiva": crime.penaDefinitiva,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatPena(value as number)} />
          <Tooltip formatter={(value) => formatPena(value as number)} />
          <Legend />
          <Bar dataKey="Pena Base" fill="#00bc7d" />
          <Bar dataKey="Pena Provisória" fill="#ffba00" />
          <Bar dataKey="Pena Definitiva" fill="#ff6467" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

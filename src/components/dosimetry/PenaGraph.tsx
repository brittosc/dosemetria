"use client";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPena } from "@/lib/calculations";

const chartConfig = {
  penaBase: {
    label: "Pena Base (1ª Fase)",
    color: "var(--chart-1)",
  },
  penaProvisoria: {
    label: "Pena Provisória (2ª Fase)",
    color: "var(--chart-2)",
  },
  penaDefinitiva: {
    label: "Pena Definitiva (3ª Fase)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function PenaGraph() {
  const { state } = useDosimetryCalculator();
  const data = state.crimes.map((crime, index) => ({
    crime: `Crime ${index + 1}`,
    penaBase: crime.penaPrimeiraFase,
    penaProvisoria: crime.penaProvisoria,
    penaDefinitiva: crime.penaDefinitiva,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{
          top: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="crime"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatPena(value as number)}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatPena(value as number)}
              labelClassName="font-bold"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="penaBase" fill="var(--color-penaBase)" radius={4}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: unknown) => formatPena(value as number)}
          />
        </Bar>
        <Bar
          dataKey="penaProvisoria"
          fill="var(--color-penaProvisoria)"
          radius={4}
        >
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: unknown) => formatPena(value as number)}
          />
        </Bar>
        <Bar
          dataKey="penaDefinitiva"
          fill="var(--color-penaDefinitiva)"
          radius={4}
        >
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: unknown) => formatPena(value as number)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

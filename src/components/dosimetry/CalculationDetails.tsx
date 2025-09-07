import { Circunstancia, CausaAplicada, Causa } from "@/lib/calculations";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  agravantesOptions,
  atenuantesOptions,
} from "@/app/data/circunstancias";

interface CalculationDetailsProps {
  circunstancias: Circunstancia[];
  causas: CausaAplicada[];
  causasData: Causa[];
  type: "increase" | "decrease";
}

export function CalculationDetails({
  circunstancias,
  causas,
  causasData,
  type,
}: CalculationDetailsProps) {
  if (circunstancias.length === 0 && causas.length === 0) return null;

  const allCircunstanciasOptions = [...agravantesOptions, ...atenuantesOptions];

  return (
    <div className="pl-4 border-l-2 border-dashed ml-2 space-y-1">
      {circunstancias.map((circ) => {
        const circInfo = allCircunstanciasOptions.find(
          (opt) => opt.id === circ.id
        );
        const label = circInfo ? circInfo.label.split(" (Art.")[0] : circ.id;

        return (
          <div key={circ.id} className="text-xs flex items-center gap-1">
            {type === "increase" ? (
              <ArrowUp className="h-3 w-3 text-red-500 shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 text-green-500 shrink-0" />
            )}
            <span>
              {label}: <span className="font-semibold">{circ.fracao}</span>
            </span>
          </div>
        );
      })}
      {causas.map((causaApp) => {
        const causaInfo = causasData.find((c) => c.id === causaApp.id);
        if (!causaInfo) return null;

        return (
          <div key={causaApp.id} className="text-xs flex items-center gap-1">
            {type === "increase" ? (
              <ArrowUp className="h-3 w-3 text-red-500 shrink-0" />
            ) : (
              <ArrowDown className="h-3 w-3 text-green-500 shrink-0" />
            )}
            <span>
              {causaInfo.descricao}:{" "}
              <span className="font-semibold">
                {typeof causaApp.valorAplicado === "number"
                  ? `x${causaApp.valorAplicado.toFixed(2)}`
                  : causaApp.valorAplicado}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

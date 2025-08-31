"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPena } from "@/lib/calculations";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";

export function CalculationSummary() {
  const { state, selectedCrime } = useDosimetryCalculator();
  const { results } = state;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo do Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold">Crime Selecionado:</p>
          <p>{selectedCrime?.nome || "Nenhum"}</p>
        </div>
        {selectedCrime && (
          <div>
            <p className="font-semibold">Pena em Abstrato:</p>
            <p>{`Mínima: ${formatPena(
              selectedCrime.penaMinimaMeses
            )} / Máxima: ${formatPena(selectedCrime.penaMaximaMeses)}`}</p>
          </div>
        )}
        <hr />
        <div>
          <p className="text-sm font-medium">1ª Fase - Pena-Base Fixada:</p>
          <p className="text-lg font-bold">
            {results.penaPrimeiraFase
              ? formatPena(results.penaPrimeiraFase)
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">2ª Fase - Pena Provisória:</p>
          <p className="text-lg font-bold">
            {results.penaProvisoria ? formatPena(results.penaProvisoria) : "--"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-green-600">
            3ª Fase - Pena Definitiva:
          </p>
          <p className="text-xl font-bold text-green-700">
            {results.penaDefinitiva ? formatPena(results.penaDefinitiva) : "--"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

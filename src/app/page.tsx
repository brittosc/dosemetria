"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { CrimeCalculator } from "@/components/dosimetry/CrimeCalculator";
import { CalculationSummary } from "@/components/dosimetry/CalculationSummary";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { state, dispatch } = useDosimetryCalculator();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.crimes.length]);

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <Button variant="outline" onClick={handleReset}>
          Reiniciar Cálculo
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {state.crimes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold">Comece seu Cálculo</h2>
                <p className="text-muted-foreground mt-2 mb-4">
                  Para iniciar a dosimetria, adicione o primeiro crime.
                </p>
                <Button onClick={() => dispatch({ type: "ADD_CRIME" })}>
                  Adicionar Crime
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {state.crimes.map((crime) => (
                <CrimeCalculator
                  key={crime.id}
                  crimeState={crime}
                  onRemove={() =>
                    dispatch({ type: "REMOVE_CRIME", payload: crime.id })
                  }
                />
              ))}
              <Button onClick={() => dispatch({ type: "ADD_CRIME" })}>
                Adicionar Outro Crime
              </Button>
            </>
          )}
        </div>
        <div className="md:col-span-1">
          <CalculationSummary />
        </div>
      </div>
    </main>
  );
}

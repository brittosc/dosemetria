"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { PhaseOne, PhaseOneFormValues } from "@/components/dosimetry/PhaseOne";
import { PhaseTwo, PhaseTwoFormValues } from "@/components/dosimetry/PhaseTwo";
import {
  PhaseThree,
  PhaseThreeFormValues,
} from "@/components/dosimetry/PhaseThree";

import { CalculationSummary } from "@/components/dosimetry/CalculationSummary";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { state, actions, crimesData, selectedCrime, causasData } =
    useDosimetryCalculator();

  const handlePhaseOneSubmit = (data: PhaseOneFormValues) => {
    actions.updatePhaseOne({
      penaBase: data.penaBase,
      circunstanciasJudiciais: data.circunstanciasJudiciais || [],
      dataCrime: data.dataCrime,
    });
    actions.calculateAndProceed();
  };

  const handlePhaseTwoSubmit = (data: PhaseTwoFormValues) => {
    actions.updatePhaseTwo({
      agravantes: data.agravantes || [],
      atenuantes: data.atenuantes || [],
    });
    actions.calculateAndProceed();
  };

  const handlePhaseThreeSubmit = (data: PhaseThreeFormValues) => {
    actions.updatePhaseThree({
      causasAumento: data.causasAumento || [],
      causasDiminuicao: data.causasDiminuicao || [],
    });
    actions.calculateAndProceed();
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Calculadora de Dosimetria da Pena
        </h1>
        <Button variant="outline" onClick={actions.reset}>
          Reiniciar Cálculo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {state.currentPhase === 1 && (
            <PhaseOne
              crimesData={crimesData}
              selectedCrime={selectedCrime}
              initialValues={{
                crimeId: state.selectedCrimeId || "",
                penaBase: state.phaseOneData.penaBase,
                circunstanciasJudiciais:
                  state.phaseOneData.circunstanciasJudiciais,
                dataCrime: state.phaseOneData.dataCrime || new Date(),
              }}
              onSelectCrime={actions.setCrime}
              onFormSubmit={handlePhaseOneSubmit}
            />
          )}

          {state.currentPhase === 2 &&
            state.results.penaPrimeiraFase != null && (
              <PhaseTwo
                initialValues={state.phaseTwoData}
                penaPrimeiraFase={state.results.penaPrimeiraFase}
                onFormSubmit={handlePhaseTwoSubmit}
                onGoBack={() => actions.goToPhase(1)}
              />
            )}

          {state.currentPhase === 3 && state.results.penaProvisoria != null && (
            <PhaseThree
              initialValues={state.phaseThreeData}
              penaProvisoria={state.results.penaProvisoria}
              causasData={causasData}
              onFormSubmit={handlePhaseThreeSubmit}
              onGoBack={() => actions.goToPhase(2)}
            />
          )}
        </div>

        <div className="md:col-span-1">
          <CalculationSummary />
        </div>
      </div>
    </main>
  );
}

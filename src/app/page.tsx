"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { PhaseOne, PhaseOneFormValues } from "@/components/dosimetry/PhaseOne";
import { PhaseTwo, PhaseTwoFormValues } from "@/components/dosimetry/PhaseTwo";
import { PhaseThree } from "@/components/dosimetry/PhaseThree";
import { CalculationSummary } from "@/components/dosimetry/CalculationSummary";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Home() {
  const { state, actions, crimesData, selectedCrime, causasData } =
    useDosimetryCalculator();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("calculo");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentPhase]);

  useEffect(() => {
    if (isMobile && state.results.penaDefinitiva != null) {
      setActiveTab("resumo");
    }
  }, [isMobile, state.results.penaDefinitiva]);

  const handlePhaseOneSubmit = (data: PhaseOneFormValues) => {
    actions.updatePhaseOne({
      penaBase: data.penaBase,
      circunstanciasJudiciais: data.circunstanciasJudiciais || [],
      dataCrime: data.dataCrime,
    });
    actions.calculateAndProceed();
    toast.success("1ª Fase Concluída!", {
      description: "Pena-base calculada. Prossiga para a 2ª fase.",
    });
  };

  const handlePhaseTwoSubmit = (data: PhaseTwoFormValues) => {
    actions.updatePhaseTwo({
      agravantes: data.agravantes || [],
      atenuantes: data.atenuantes || [],
    });
    actions.calculateAndProceed();
    toast.success("2ª Fase Concluída!", {
      description: "Pena provisória calculada. Prossiga para a 3ª fase.",
    });
  };
  const handleReset = () => {
    actions.reset();
    if (isMobile) {
      setActiveTab("calculo");
    }
  };

  const renderContent = () => {
    if (state.results.penaDefinitiva != null && isMobile) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">Cálculo Finalizado</h2>
          <p className="text-muted-foreground">
            A pena definitiva foi calculada. Veja o resumo completo.
          </p>
          <Button onClick={handleReset} size="lg">
            Fazer Novo Cálculo
          </Button>
        </div>
      );
    }

    switch (state.currentPhase) {
      case 1:
        return (
          <PhaseOne
            crimesData={crimesData}
            selectedCrime={selectedCrime}
            initialValues={{
              crimeId: state.selectedCrimeId || "",
              penaBase: state.phaseOneData.penaBase,
              circunstanciasJudiciais:
                state.phaseOneData.circunstanciasJudiciais,
              dataCrime: state.phaseOneData.dataCrime || new Date(),
              qualificadoraId: state.phaseOneData.selectedQualificadoraId,
            }}
            onSelectCrime={actions.setCrime}
            onSelectQualificadora={actions.setQualificadora}
            onFormSubmit={handlePhaseOneSubmit}
          />
        );
      case 2:
        if (state.results.penaPrimeiraFase != null) {
          return (
            <PhaseTwo
              initialValues={state.phaseTwoData}
              penaPrimeiraFase={state.results.penaPrimeiraFase}
              onFormSubmit={handlePhaseTwoSubmit}
              onGoBack={() => actions.goToPhase(1)}
            />
          );
        }
        return null;
      case 3:
        if (state.results.penaProvisoria != null) {
          return (
            <PhaseThree
              initialValues={state.phaseThreeData}
              penaProvisoria={state.results.penaProvisoria}
              causasData={causasData}
              onGoBack={() => actions.goToPhase(2)}
              setActiveTab={setActiveTab} // Passando a função setActiveTab
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Dosimetria da Pena</h1>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reiniciar
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculo">Cálculo</TabsTrigger>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
          </TabsList>
          <TabsContent value="calculo" className="mt-4">
            {renderContent()}
          </TabsContent>
          <TabsContent value="resumo" className="mt-4">
            <CalculationSummary />
          </TabsContent>
        </Tabs>
      </main>
    );
  }

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
        <div className="md:col-span-2">{renderContent()}</div>
        <div className="md:col-span-1">
          <CalculationSummary />
        </div>
      </div>
    </main>
  );
}

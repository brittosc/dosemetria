"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { CrimeCalculator } from "@/components/dosimetry/CrimeCalculator";
import { CalculationSummary } from "@/components/dosimetry/CalculationSummary";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CrimeTimelineHorizontal } from "@/components/dosimetry/Timeline";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/dosimetry/EmptyState";
import { DosimetryState } from "@/app/contexts/DosimetryProvider";

export default function Home() {
  const { state, dispatch } = useDosimetryCalculator();
  const isInitialMount = useRef(true);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    // Evita recarregar do localStorage em re-renders,
    // o que aconteceria ao voltar da página /report
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const savedState = localStorage.getItem("dosimetryState");
      if (savedState) {
        try {
          const parsedState: DosimetryState = JSON.parse(savedState);
          // Converte strings de data de volta para objetos Date
          parsedState.crimes.forEach((crime) => {
            if (crime.dataCrime) {
              crime.dataCrime = new Date(crime.dataCrime);
            }
          });
          parsedState.detracaoPeriodos.forEach((periodo) => {
            if (periodo.inicio) periodo.inicio = new Date(periodo.inicio);
            if (periodo.fim) periodo.fim = new Date(periodo.fim);
          });

          dispatch({ type: "LOAD_STATE", payload: parsedState });
        } catch (error) {
          console.error("Failed to parse saved state:", error);
          localStorage.removeItem("dosimetryState"); // Limpa estado corrompido
        }
      }
    }
  }, [dispatch]);

  // Salvar no localStorage a cada mudança
  useEffect(() => {
    // Não salva no mount inicial se não houver crimes para não sobrescrever o estado vazio
    if (!isInitialMount.current) {
      localStorage.setItem("dosimetryState", JSON.stringify(state));
    }
  }, [state]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-4">
          <CrimeTimelineHorizontal />

          {state.crimes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmptyState onAddCrime={() => dispatch({ type: "ADD_CRIME" })} />
            </motion.div>
          ) : (
            <>
              {state.crimes.map((crime, index) => (
                <motion.div
                  key={crime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CrimeCalculator
                    crimeState={crime}
                    onRemove={() =>
                      dispatch({ type: "REMOVE_CRIME", payload: crime.id })
                    }
                  />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: state.crimes.length * 0.1,
                }}
              >
                <Button onClick={() => dispatch({ type: "ADD_CRIME" })}>
                  Adicionar Outro Crime
                </Button>
              </motion.div>
            </>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {" "}
            {/* Ajustado o top para a altura do header */}
            {state.crimes.length > 0 && <CalculationSummary />}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

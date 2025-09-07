"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { CrimeCalculator } from "@/components/dosimetry/CrimeCalculator";
import { CalculationSummary } from "@/components/dosimetry/CalculationSummary";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CrimeTimelineHorizontal } from "@/components/dosimetry/Timeline";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/dosimetry/EmptyState";

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
        <h1 className="text-3xl font-bold flex items-center"></h1>
        <Button variant="outline" onClick={handleReset}>
          Reiniciar Cálculo
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                transition={{ duration: 0.5, delay: state.crimes.length * 0.1 }}
              >
                <Button onClick={() => dispatch({ type: "ADD_CRIME" })}>
                  Adicionar Outro Crime
                </Button>
              </motion.div>
            </>
          )}
        </div>
        <div className="lg:col-span-1">
          <CalculationSummary />
        </div>
      </div>
      <Footer />
    </main>
  );
}

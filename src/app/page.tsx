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
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PrescriptionCalculator } from "@/components/dosimetry/PrescriptionCalculator";
import { ExecutionSummary } from "@/components/dosimetry/ExecutionSummary";
import { CrimeState, DosimetryState } from "@/app/contexts/DosimetryProvider";

export default function Home() {
  const { state, dispatch } = useDosimetryCalculator();

  // Carregar do localStorage na inicialização
  useEffect(() => {
    const savedState = localStorage.getItem("dosimetryState");
    if (savedState) {
      const parsedState: DosimetryState = JSON.parse(savedState);
      // Dispatch de um RESET para garantir que o estado seja limpo e depois carregado
      dispatch({ type: "RESET" });
      parsedState.crimes.forEach((crime: CrimeState) => {
        // Adiciona e atualiza cada crime para garantir que todos os cálculos sejam refeitos
        dispatch({ type: "ADD_CRIME" });
        dispatch({ type: "UPDATE_CRIME", payload: crime });
      });
    }
  }, [dispatch]);

  // Salvar no localStorage a cada mudança
  useEffect(() => {
    localStorage.setItem("dosimetryState", JSON.stringify(state));
  }, [state]);

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calculo-dosimetria-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cálculo exportado com sucesso!");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === "string") {
            const importedState: DosimetryState = JSON.parse(content);
            dispatch({ type: "RESET" });
            importedState.crimes.forEach((crime: CrimeState) => {
              dispatch({ type: "ADD_CRIME" });
              dispatch({ type: "UPDATE_CRIME", payload: crime });
            });
            toast.success("Cálculo importado com sucesso!");
          }
        } catch {
          toast.error(
            "Erro ao importar o arquivo. Verifique se o formato é válido."
          );
        }
      };
      reader.readAsText(file);
      // Limpa o valor do input para permitir importar o mesmo arquivo novamente
      event.target.value = "";
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-file" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Importar
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Prescrição</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cálculo de Prescrição</DialogTitle>
                <DialogDescription>
                  Calcule a prescrição com base na pena máxima em abstrato do
                  crime.
                </DialogDescription>
              </DialogHeader>
              <PrescriptionCalculator />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => dispatch({ type: "RESET" })}>
            Reiniciar
          </Button>
        </div>
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
          <div className="sticky top-8 space-y-4">
            <CalculationSummary />
            {state.crimes.length > 0 && <ExecutionSummary />}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

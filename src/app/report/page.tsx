"use client";

import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPena, formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  const { state } = useDosimetryCalculator();
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold">Relatório do Cálculo</h1>
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mr-2"
          >
            Voltar
          </Button>
          <Button onClick={handlePrint}>Imprimir / Salvar PDF</Button>
        </div>
      </div>

      <div className="space-y-6">
        {state.crimes.map((crime, index) => (
          <Card key={crime.id}>
            <CardHeader>
              <CardTitle>
                Crime {index + 1}: {state.crimes[index].crimeId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  <strong>Data do Crime:</strong>{" "}
                  {crime.dataCrime
                    ? format(new Date(crime.dataCrime), "PPP", { locale: ptBR })
                    : "Não informada"}
                </p>
                <p>
                  <strong>Pena-Base:</strong>{" "}
                  {formatPena(crime.penaPrimeiraFase)}
                </p>
                <p>
                  <strong>Pena Provisória:</strong>{" "}
                  {formatPena(crime.penaProvisoria)}
                </p>
                <p>
                  <strong>Pena Definitiva:</strong>{" "}
                  {formatPena(crime.penaDefinitiva)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Resumo Final</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Pena Total (sem detração):</strong>{" "}
              {formatPena(state.finalResults.penaTotal)}
            </p>
            {state.finalResults.multaTotal && (
              <p>
                <strong>Multa Total:</strong>{" "}
                {formatCurrency(state.finalResults.multaTotal)}
              </p>
            )}
            <p>
              <strong>Regime Inicial:</strong>{" "}
              {state.finalResults.regimeInicial}
            </p>
            <p>
              <strong>Pode Substituir a Pena:</strong>{" "}
              {state.finalResults.podeSubstituir ? "Sim" : "Não"}
            </p>
            <p>
              <strong>Pode Sursis:</strong>{" "}
              {state.finalResults.podeSursis ? "Sim" : "Não"}
            </p>
            {state.finalResults.dataFinalPena && (
              <p>
                <strong>Data Final da Pena:</strong>{" "}
                {format(state.finalResults.dataFinalPena, "PPP", {
                  locale: ptBR,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

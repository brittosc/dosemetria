import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ChangelogPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Changelog</h1>
        <Button asChild variant="outline">
          <Link href="/">&larr; Voltar para a Calculadora</Link>
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Versão 0.85.2332</CardTitle>
            <CardDescription>05 de Setembro de 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold">
              🎉 Lançamento inicial da Calculadora de Dosimetria da Pena!
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Cálculo trifásico da dosimetria para múltiplos crimes.</li>
              <li>Seleção de crimes e qualificadoras do Código Penal.</li>
              <li>
                Cálculo de concurso de crimes (material, formal e continuado).
              </li>
              <li>
                Resumo final com pena total, regime, benefícios e data final.
              </li>
              <li>
                Interface responsiva para uso em desktop e dispositivos móveis.
              </li>
            </ul>
          </CardContent>
        </Card>
        {/* Você pode adicionar novas versões aqui no futuro */}
      </div>
    </main>
  );
}

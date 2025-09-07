import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <Button asChild variant="outline">
          <Link href="/">&larr; Voltar para a Calculadora</Link>
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Versão 0.90.2333</CardTitle>
            <CardDescription>06 de Setembro de 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-2">✨ Melhorias</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <Badge variant="secondary" className="mr-2">
                    UI/UX
                  </Badge>
                  Adicionado um indicador de passos (stepper) para guiar o
                  usuário pelas 3 fases do cálculo, melhorando a experiência
                  mobile.
                </li>
                <li>
                  <Badge variant="secondary" className="mr-2">
                    UI/UX
                  </Badge>
                  Tela inicial aprimorada com uma ilustração para um estado
                  vazio mais amigável.
                </li>
                <li>
                  <Badge variant="secondary" className="mr-2">
                    Precisão
                  </Badge>
                  O slider de valor do dia-multa agora exibe duas casas
                  decimais, oferecendo um feedback mais preciso ao usuário.
                </li>
                <li>
                  <Badge variant="secondary" className="mr-2">
                    Estrutura
                  </Badge>
                  Centralizada a lista de circunstâncias (agravantes/atenuantes)
                  para reuso em diferentes componentes.
                </li>
                <li>
                  <Badge variant="secondary" className="mr-2">
                    Layout
                  </Badge>
                  Adicionada uma seção de &apos;Contribuidores&apos; no rodapé.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">🐞 Correções</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <Badge variant="destructive" className="mr-2">
                    Cálculo
                  </Badge>
                  Corrigida a lógica da dosimetria trifásica para que a 2ª fase
                  utilize a pena da 1ª fase como base de cálculo.
                </li>
                <li>
                  <Badge variant="destructive" className="mr-2">
                    Cálculo
                  </Badge>
                  Refatorada a lógica de cálculo de datas e durações para usar
                  `date-fns`, garantindo precisão e eliminando bugs de
                  arredondamento (como o &apos;dia extra&apos; ou a exibição de
                  &apos;5 meses e 30 dias&apos;).
                </li>
                <li>
                  <Badge variant="destructive" className="mr-2">
                    UI
                  </Badge>
                  O resumo do cálculo agora exibe o nome completo das
                  circunstâncias em vez de seus IDs (ex: &apos;Menor de 21 ou
                  maior de 70 anos&apos;).
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
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
      </div>
    </main>
  );
}

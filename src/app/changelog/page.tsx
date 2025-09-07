import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Star,
  Bug,
  GitBranch,
  ShieldCheck,
  LineChart,
  MousePointer,
  Save,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react"; // SVGSVGElement removido daqui

// Definição dos tipos para garantir a consistência dos dados
// SVGSVGElement é um tipo global e não precisa ser importado.
type ChangelogItemType = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  type: string;
  color: string;
  title: string;
  description: string;
};

type ChangelogSectionType = {
  date: string;
  title: string;
  items: ChangelogItemType[];
};

// Dados completos do changelog, agora seguindo o tipo definido
const changelogData: ChangelogSectionType[] = [
  {
    date: "07 de Setembro de 2025",
    title: "Versão 0.96.2334",
    items: [
      {
        icon: ShieldCheck,
        type: "Melhoria",
        color: "text-green-500",
        title: "Cálculo Preciso da Progressão de Regime",
        description:
          "A progressão de regime agora segue estritamente os percentuais da Lei de Execução Penal, considerando as características do crime e do apenado.",
      },
      {
        icon: LineChart,
        type: "Melhoria",
        color: "text-blue-500",
        title: "Visualização da Pena em Gráfico de Linhas",
        description:
          "Para facilitar o entendimento, a evolução da pena agora é exibida em um gráfico de linhas, tornando a progressão mais clara.",
      },
      {
        icon: Bug,
        type: "Correção",
        color: "text-red-500",
        title: "Maior Precisão em Crimes Qualificados",
        description:
          "Corrigido um bug que impedia o cálculo correto da progressão de regime para crimes qualificados, como o Latrocínio.",
      },
      {
        icon: Save,
        type: "Funcionalidade",
        color: "text-yellow-500",
        title: "Exportação e Importação de Cálculos",
        description:
          "Agora é possível salvar seus cálculos em um arquivo (.json) e carregá-los novamente, facilitando o arquivamento de casos.",
      },
      {
        icon: MousePointer,
        type: "Melhoria",
        color: "text-purple-500",
        title: "Melhoria na Navegação da Página",
        description:
          "A coluna de resumo agora permanece fixa na tela durante a rolagem, facilitando a visualização dos resultados a todo momento.",
      },
    ],
  },
  {
    date: "06 de Setembro de 2025",
    title: "Versão 0.90.2333",
    items: [
      {
        icon: GitBranch,
        type: "Melhoria",
        color: "text-blue-500",
        title: "Navegação em Fases (Stepper)",
        description:
          "Adicionado um guia visual de 3 passos para facilitar a navegação entre as fases do cálculo da pena.",
      },
      {
        icon: Bug,
        type: "Correção",
        color: "text-red-500",
        title: "Correções Gerais nos Cálculos",
        description:
          "Aprimorada a lógica de cálculo da 2ª fase e a contagem de tempo para garantir maior precisão nos resultados.",
      },
    ],
  },
  {
    date: "05 de Setembro de 2025",
    title: "Versão 0.85.2332",
    items: [
      {
        icon: Star,
        type: "Lançamento",
        color: "text-yellow-500",
        title: "🎉 Lançamento Inicial da Calculadora",
        description:
          "Cálculo trifásico, seleção de crimes do Código Penal, cálculo de concurso de crimes e resumo final com regime e benefícios.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Evolução do Projeto
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe aqui as novidades, melhorias e correções da Calculadora de
            Dosimetria em nossa linha do tempo.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">&larr; Voltar para a Calculadora</Link>
          </Button>
        </header>

        <div className="relative">
          {/* A linha vertical da timeline */}
          <div className="absolute left-4 md:left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-16">
            {changelogData.map((section, sectionIndex) => (
              <div key={sectionIndex} className="relative pl-12 md:pl-14">
                {/* O ponto na timeline */}
                <div className="absolute left-4 md:left-5 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary -translate-x-1/2">
                  <div className="h-3 w-3 rounded-full bg-primary-foreground" />
                </div>

                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {section.date}
                  </p>
                </div>

                <div className="space-y-6">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <div key={itemIndex} className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 rounded-full bg-muted p-2 ${item.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

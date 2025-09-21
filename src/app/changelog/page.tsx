"use client"; // Necessário para animações e hooks

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
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { motion } from "framer-motion"; // Importa o framer-motion

// Definição dos tipos para garantir a consistência dos dados
type ChangelogItemType = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  type?: string;
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
    date: "20 de Setembro de 2025",
    title: "Versão 1.0.0 - Melhoria no Cálculo da Prescrição",
    items: [
      {
        icon: ShieldCheck,
        color: "text-green-500",
        title: "Lógica de Cálculo da Prescrição Aprimorada",
        description:
          "A função de cálculo da prescrição foi refeita para considerar marcos interruptivos e suspensivos, proporcionando um resultado muito mais preciso e alinhado com a legislação.",
      },
      {
        icon: MousePointer,
        color: "text-purple-500",
        title: "Nova Interface para a Calculadora de Prescrição",
        description:
          "A interface da calculadora de prescrição foi atualizada com novos campos para as datas dos marcos interruptivos, além de uma linha do tempo para visualização do cálculo.",
      },
      {
        icon: Bug,
        color: "text-red-500",
        title: "Correção na Contagem de Prazos",
        description:
          "A contagem dos prazos prescricionais foi ajustada para refletir corretamente a redução pela metade para menores de 21 e maiores de 70 anos, e o aumento para reincidentes na prescrição executória.",
      },
    ],
  },
  {
    date: "20 de Setembro de 2025",
    title: "Versão 0.98.2334",
    items: [
      {
        icon: ShieldCheck,
        color: "text-green-500",
        title: "Validação de Formulário Aprimorada (Zod)",
        description:
          "A validação da pena-base e da data do crime foi centralizada no esquema Zod, tornando as regras de negócio mais consistentes e fáceis de manter.",
      },
      {
        icon: MousePointer,
        color: "text-purple-500",
        title: "Melhoria de Interface (UI/UX)",
        description:
          "Implementado layout responsivo de duas colunas, com o resumo do cálculo fixo na lateral para melhor visualização em desktops.",
      },
      {
        icon: GitBranch,
        color: "text-blue-500",
        title: "Navegação Guiada no Stepper",
        description:
          "O seletor de fases (Stepper) agora é desabilitado para etapas futuras caso nenhum crime tenha sido selecionado, guiando o usuário de forma mais intuitiva.",
      },
      {
        icon: Wrench,
        color: "text-indigo-500",
        title: "Refatoração e Qualidade de Código",
        description:
          "A lógica para determinar o valor inicial de uma causa de aumento/diminuição foi centralizada. Adicionados testes unitários iniciais para as funções de cálculo.",
      },
      {
        icon: Bug,
        color: "text-red-500",
        title: "Correção na Validação de Fases",
        description:
          "Corrigido um bug crítico que permitia ao usuário avançar para as próximas fases do cálculo mesmo com erros de validação (como uma data inválida).",
      },
      {
        icon: AlertTriangle,
        color: "text-yellow-500",
        title: "Mensagens de Erro Específicas",
        description:
          "As notificações de erro no formulário agora são específicas, informando exatamente qual campo precisa ser corrigido.",
      },
    ],
  },
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

        <div className="relative mb-96">
          {/* A linha vertical da timeline */}
          <div className="absolute left-4 md:left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-16">
            {changelogData.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                className="relative pl-12 md:pl-14"
                initial={{ opacity: 0, y: 250 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.6 }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

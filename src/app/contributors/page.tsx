import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const contributors = [
  {
    name: "Mauricio de Britto",
    avatarUrl: "https://github.com/brittosc.png",
    role: "Criador e Desenvolvedor Principal",
    url: "https://github.com/brittosc",
    linkText: "Perfil no GitHub",
  },
  {
    name: "Amanda Pereira",
    avatarUrl: "/amanda.jpg",
    role: "Analista de Qualidade",
    url: "https://www.instagram.com/_amandapereira__/",
    linkText: "Perfil no Instagram",
  },
  {
    name: "Mario Luiz Silva",
    avatarUrl: "/mario.jpg",
    role: "Consultoria Jurídica e Validação dos Cálculos",
    url: "https://www.instagram.com/tcmarioluiz/",
    linkText: "Perfil no Instagram",
  },
  {
    name: "Leandro Alfredo da Rosa",
    avatarUrl: "/leandro.png",
    role: "Consultoria Jurídica e Validação dos Cálculos",
    url: "https://www.instagram.com/leandroa.rosa/",
    linkText: "Perfil no Instagram",
  },
  // {
  //   name: "Michel Juarez da Silva Souza",
  //   avatarUrl: "/michel.png",
  //   role: "Analista de Qualidade",
  // },
];

export default function ContributorsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <Button asChild variant="outline">
          <Link href="/">&larr; Voltar para a Calculadora</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Este projeto é de código aberto e foi construído graças à contribuição
          das seguintes pessoas:
        </p>
        {contributors.map((contributor) => (
          <Card key={contributor.name}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                />
                <AvatarFallback>
                  {contributor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{contributor.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {contributor.role}
                </p>
                {contributor.url && contributor.linkText && (
                  <a
                    href={contributor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500"
                  >
                    {contributor.linkText}
                  </a>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}

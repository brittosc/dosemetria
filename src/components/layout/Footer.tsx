import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">
      <Separator className="mb-8" />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <span>Calculadora de Dosimetria v{version}</span>
        <Link
          href="/changelog"
          className="hover:text-foreground transition-colors"
        >
          Changelog
        </Link>
        <span>
          Criado por{" "}
          <a
            href="https://github.com/brittosc"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-foreground transition-colors"
          >
            brittosc
          </a>
        </span>
      </div>
      <p className="mt-4">
        Esta é uma ferramenta de código aberto. Contribuições são bem-vindas!
      </p>
    </footer>
  );
}

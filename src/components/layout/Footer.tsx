import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">
      <Separator className="mb-8" />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <span>Calculadora de Dosimetria v0.96.2334</span>
        <Link
          href="/changelog"
          className="hover:text-foreground transition-colors"
        >
          Changelog
        </Link>
        <Link
          href="/contributors"
          className="hover:text-foreground transition-colors"
        >
          Contribuidores
        </Link>
        <span>
          <a
            href="https://github.com/brittosc/dosemetria"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Repositório
          </a>
        </span>
      </div>
      <p className="mt-4">
        Esta é uma ferramenta de código aberto. Contribuições são bem-vindas!
      </p>
    </footer>
  );
}

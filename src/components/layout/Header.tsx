// src/components/layout/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import {
  Download,
  Upload,
  FileText,
  Gavel,
  Menu,
  Scale,
  RotateCcw,
} from "lucide-react";
import { useDosimetryCalculator } from "@/hooks/useDosimetryCalculator";
import { DosimetryState } from "@/app/contexts/DosimetryProvider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrescriptionCalculator } from "../dosimetry/PrescriptionCalculator";

const navigationLinks = [{ href: "/contributors", label: "" }];

const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2 text-primary hover:text-primary/90"
  >
    <Scale className="text-muted-foreground size-8" />
  </Link>
);

export function Header() {
  const { state, dispatch } = useDosimetryCalculator();

  const handleReset = () => {
    localStorage.removeItem("dosimetryState");
    dispatch({ type: "RESET" });
    toast.success("Cálculo reiniciado.");
  };

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
            importedState.crimes.forEach((crime) => {
              if (crime.dataCrime) {
                crime.dataCrime = new Date(crime.dataCrime);
              }
            });
            importedState.detracaoPeriodos.forEach((periodo) => {
              if (periodo.inicio) periodo.inicio = new Date(periodo.inicio);
              if (periodo.fim) periodo.fim = new Date(periodo.fim);
            });
            dispatch({ type: "LOAD_STATE", payload: importedState });
            toast.success("Cálculo importado com sucesso!");
          }
        } catch {
          toast.error(
            "Erro ao importar o arquivo. Verifique se o formato é válido.",
          );
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }
  };

  const actionButtons = (
    <>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" /> Exportar
      </Button>
      <Button variant="outline" size="sm" asChild>
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
          <Button variant="outline" size="sm">
            <Gavel className="mr-2 h-4 w-4" />
            Prescrição
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cálculo de Prescrição</DialogTitle>
            <DialogDescription>
              Calcule a prescrição com base na pena máxima em abstrato do crime.
            </DialogDescription>
          </DialogHeader>
          <PrescriptionCalculator />
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          state.crimes.length > 0 && window.open("/report", "_blank")
        }
        disabled={state.crimes.length === 0}
      >
        <FileText className="mr-2 h-4 w-4" /> Ver Relatório
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleReset}
        disabled={state.crimes.length === 0}
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar
      </Button>
    </>
  );

  return (
    <header className="no-print border-b px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="flex h-16 items-center justify-between">
        <Logo />
        <div className="flex-1 flex justify-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">{actionButtons}</div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="flex flex-col gap-2">
                {actionButtons}
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink asChild>
                          <Link href={link.href} className="py-1.5 text-sm">
                            {link.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

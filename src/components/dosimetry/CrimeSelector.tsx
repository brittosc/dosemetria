"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Crime } from "@/types/crime";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormControl } from "../ui/form";

interface CrimeSelectorProps {
  selectedCrime?: Crime;
  crimesData: Crime[];
  onCrimeChange: (crimeId: string) => void;
}

export function CrimeSelector({
  selectedCrime,
  crimesData,
  onCrimeChange,
}: CrimeSelectorProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const CrimeSelectorContent = () => (
    <Command>
      <CommandInput placeholder="Buscar crime..." />
      <CommandEmpty>Nenhum crime encontrado.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {crimesData.map((crime: Crime) => (
            <CommandItem
              value={`${crime.nome} ${crime.artigo}`}
              key={crime.id}
              onSelect={() => {
                onCrimeChange(crime.id);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  crime.id === selectedCrime?.id ? "opacity-100" : "opacity-0"
                )}
              />
              {crime.nome} (Art. {crime.artigo})
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between",
              !selectedCrime && "text-muted-foreground"
            )}
          >
            {selectedCrime
              ? `${selectedCrime.nome} (Art. ${selectedCrime.artigo})`
              : "Selecione o crime"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Selecione o Crime</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <CrimeSelectorContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !selectedCrime && "text-muted-foreground"
            )}
          >
            {selectedCrime
              ? `${selectedCrime.nome} (Art. ${selectedCrime.artigo})`
              : "Selecione o crime"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <CrimeSelectorContent />
      </PopoverContent>
    </Popover>
  );
}

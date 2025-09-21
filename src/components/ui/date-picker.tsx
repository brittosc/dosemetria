"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date; // Propriedade adicionada para limitar a data final
};

export function DatePicker({
  date,
  setDate,
  disabled,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [month, setMonth] = React.useState<Date>(
    date || fromDate || new Date(),
  );

  React.useEffect(() => {
    if (date) {
      setMonth(date);
    } else if (fromDate) {
      setMonth(fromDate);
    }
  }, [date, fromDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: ptBR })
          ) : (
            <span>Escolha uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month}
          onMonthChange={setMonth}
          locale={ptBR}
          captionLayout="dropdown"
          fromYear={1970}
          toYear={new Date().getFullYear()}
          fromDate={fromDate}
          toDate={toDate} // Propriedade aplicada aqui
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

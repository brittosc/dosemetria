"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { calculatePrescription, formatPena } from "@/lib/calculations";

const prescriptionSchema = z.object({
  penaMaxima: z.number().min(0, "A pena máxima deve ser positiva."),
  causasInterruptivas: z.boolean(),
});

export function PrescriptionCalculator() {
  const [prescriptionResult, setPrescriptionResult] = useState<number | null>(
    null
  );
  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      penaMaxima: 0,
      causasInterruptivas: false,
    },
  });

  function onSubmit(values: z.infer<typeof prescriptionSchema>) {
    const result = calculatePrescription(
      values.penaMaxima,
      values.causasInterruptivas
    );
    setPrescriptionResult(result);
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="penaMaxima"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pena Máxima em Abstrato (meses)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="causasInterruptivas"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Ocorreram causas interruptivas da prescrição?
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">Calcular Prescrição</Button>
        </form>
      </Form>
      {prescriptionResult !== null && (
        <div className="mt-6">
          <p className="font-semibold">A prescrição ocorrerá em:</p>
          <p className="text-xl font-bold text-green-700">
            {formatPena(prescriptionResult)}
          </p>
        </div>
      )}
    </div>
  );
}

import { z } from "zod";

// Mantido para referência ou uso futuro, mas não mais ligado diretamente ao formulário.
export const crimeSelectionSchema = z.object({
  crimeId: z.string().min(1, "Selecione um crime para começar."),
});

const causaSchema = z.object({
  id: z.string(),
  valorAplicado: z.union([z.number().min(0), z.string()]),
});

export const phaseOneSchema = z.object({
  penaBase: z.number().min(0, "A pena base deve ser um valor positivo."),
});

export const phaseThreeSchema = z.object({
  causasAumento: z.array(causaSchema).optional(),
  causasDiminuicao: z.array(causaSchema).optional(),
});

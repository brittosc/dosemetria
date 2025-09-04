import { z } from "zod";

// Mantido para referência ou uso futuro, mas não mais ligado diretamente ao formulário.
export const crimeSelectionSchema = z.object({
  crimeId: z.string().min(1, "Selecione um crime para começar."),
});

const causaSchema = z.object({
  id: z.string(),
  valorAplicado: z.union([z.number().min(0), z.string()]),
});

export const phaseThreeSchema = z.object({
  causasAumento: z.array(causaSchema).optional(),
  causasDiminuicao: z.array(causaSchema).optional(),
});

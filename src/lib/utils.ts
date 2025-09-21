import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número como moeda BRL para exibição final.
 * Ex: 1412 => "R$ 1.412,00"
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata um número para ser exibido em um input de moeda.
 * Remove a formatação de "R$" para ser mais limpo no campo.
 * Ex: 1412.5 => "1.412,50"
 */
export const formatBRLCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

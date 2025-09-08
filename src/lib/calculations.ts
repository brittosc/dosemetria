// src/lib/calculations.ts

import { CrimeState, DetracaoPeriodo } from "@/app/contexts/DosimetryProvider";
import { add, differenceInDays } from "date-fns";

export type Causa = {
  id: string;
  artigo: string;
  paragrafo?: string;
  descricao: string;
  tipo: string;
  valor: {
    tipo:
      | "fracao"
      | "multiplicador"
      | "range"
      | "dobro"
      | "triplo"
      | "range_fracao_dobro"
      | "fixa"
      | "range_ate";
    valor?: number;
    min?: number;
    max?: number;
    fracao?: string;
    penaMinimaMeses?: number;
    penaMaximaMeses?: number;
  };
};

export type CausaAplicada = {
  id: string;
  valorAplicado: number | string;
};

export type Circunstancia = {
  id: string;
  fracao: string;
};

function parseFraction(fracao: string): number {
  if (!fracao || typeof fracao !== "string") return 0;

  if (fracao.toLowerCase().trim() === "metade") {
    return 0.5;
  }

  if (fracao.includes("/")) {
    const parts = fracao.split("/");
    if (parts.length === 2) {
      const numerator = parseInt(parts[0], 10);
      const denominator = parseInt(parts[1], 10);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }
  return 0;
}

export function calculatePhaseOne(
  penaBase: number,
  circunstancias: Circunstancia[]
): number {
  const aumentoTotal = circunstancias.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    // Na 1ª fase, a fração incide sobre a pena-base.
    return acc + fracao * penaBase;
  }, 0);
  return penaBase + aumentoTotal;
}

export function calculatePhaseTwo(
  penaPrimeiraFase: number,
  agravantes: Circunstancia[],
  atenuantes: Circunstancia[],
  penaMinima: number
): number {
  let penaProvisoria = penaPrimeiraFase;

  const aumento = agravantes.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    return acc + fracao * penaPrimeiraFase;
  }, 0);

  const diminuicao = atenuantes.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    return acc + fracao * penaPrimeiraFase;
  }, 0);

  penaProvisoria += aumento - diminuicao;

  // A pena provisória não pode ser inferior à pena mínima legal.
  return Math.max(penaProvisoria, penaMinima);
}

export function calculatePhaseThree(
  penaProvisoria: number,
  causasAumento: CausaAplicada[],
  causasDiminuicao: CausaAplicada[],
  causasData: Causa[]
): number {
  let penaAtual = penaProvisoria;

  causasAumento.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;

    const valor =
      typeof causaAplicada.valorAplicado === "string"
        ? parseFraction(causaAplicada.valorAplicado)
        : causaAplicada.valorAplicado;

    if (causaInfo.valor.tipo === "dobro" || causaInfo.valor.tipo === "triplo") {
      penaAtual *= valor;
    } else {
      penaAtual += penaAtual * valor;
    }
  });

  causasDiminuicao.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;

    const fracao =
      typeof causaAplicada.valorAplicado === "string"
        ? parseFraction(causaAplicada.valorAplicado)
        : causaAplicada.valorAplicado;

    penaAtual -= penaAtual * fracao;
  });

  return Math.max(0, penaAtual);
}

export function calculateDetracaoTotal(periodos: DetracaoPeriodo[]): number {
  return periodos.reduce((total, periodo) => {
    if (periodo.inicio && periodo.fim) {
      const inicio = new Date(periodo.inicio);
      const fim = new Date(periodo.fim);
      if (inicio < fim) {
        return total + differenceInDays(fim, inicio) + 1;
      }
    }
    return total;
  }, 0);
}

export function calculateRemicaoTotal(
  diasTrabalhados: number,
  horasEstudo: number
): number {
  const remicaoTrabalho = Math.floor(diasTrabalhados / 3);
  const remicaoEstudo = Math.floor(horasEstudo / 12);
  return remicaoTrabalho + remicaoEstudo;
}

export function formatPena(totalMeses: number | null | undefined): string {
  if (
    totalMeses === null ||
    totalMeses === undefined ||
    isNaN(totalMeses) ||
    totalMeses < 0
  ) {
    return "--";
  }

  if (totalMeses < 1 / 30) {
    return "0 dias";
  }

  let anos = Math.floor(totalMeses / 12);
  const mesesRestantes = totalMeses % 12;
  let meses = Math.floor(mesesRestantes);
  let dias = Math.round((mesesRestantes - meses) * 30);

  if (dias >= 30) {
    meses += 1;
    dias = 0;
  }

  if (meses >= 12) {
    anos += 1;
    meses = 0;
  }

  const parts = [];
  if (anos > 0) {
    parts.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  }
  if (meses > 0) {
    parts.push(`${meses} ${meses > 1 ? "meses" : "mês"}`);
  }
  if (dias > 0) {
    parts.push(`${dias} dia${dias > 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return "0 dias";
  }

  return parts.join(" e ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatValorDiaMulta(
  valor: number,
  salarioMinimo: number
): string {
  const epsilon = 0.001;
  if (Math.abs(valor - 1 / 30) < epsilon) {
    return `1/30 do salário mínimo (${formatCurrency(valor * salarioMinimo)})`;
  }

  if (valor < 1) {
    const denominator = Math.round(1 / valor);
    if (denominator === 1) {
      return `${valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}x o salário mínimo (${formatCurrency(valor * salarioMinimo)})`;
    }
    return `1/${denominator} do salário mínimo (${formatCurrency(
      valor * salarioMinimo
    )})`;
  }

  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}x o salário mínimo (${formatCurrency(valor * salarioMinimo)})`;
}

export function calculateMulta(
  diasMulta: number,
  valorDiaMulta: number,
  salarioMinimo: number
): number {
  return diasMulta * valorDiaMulta * salarioMinimo;
}

export function calculateFinalDate(startDate: Date, totalMeses: number): Date {
  const mesesInteiros = Math.floor(totalMeses);
  const diasDecimais = (totalMeses - mesesInteiros) * 30;

  const finalDate = add(startDate, {
    months: mesesInteiros,
    days: Math.round(diasDecimais),
  });

  return finalDate;
}

export function calculateConcursoMaterial(crimes: CrimeState[]): number {
  return crimes.reduce((acc, crime) => acc + (crime.penaDefinitiva || 0), 0);
}

const getAumentoConcurso = (numCrimes: number): string => {
  if (numCrimes <= 2) return "1/6";
  if (numCrimes === 3) return "1/5";
  if (numCrimes === 4) return "1/4";
  if (numCrimes === 5) return "1/3";
  if (numCrimes === 6) return "1/2";
  return "2/3";
};

export function calculateConcursoFormal(crimes: CrimeState[]): number {
  if (crimes.length === 0) return 0;
  const penaMaisGrave = Math.max(...crimes.map((c) => c.penaDefinitiva || 0));
  const fracaoAumento = getAumentoConcurso(crimes.length);
  const aumento = parseFraction(fracaoAumento);
  return penaMaisGrave * (1 + aumento);
}

export function calculateCrimeContinuado(crimes: CrimeState[]): number {
  if (crimes.length === 0) return 0;
  const penaMaisGrave = Math.max(...crimes.map((c) => c.penaDefinitiva || 0));
  const fracaoAumento = getAumentoConcurso(crimes.length);
  const aumento = parseFraction(fracaoAumento);
  return penaMaisGrave * (1 + aumento);
}

export function calculateRegimeInicial(
  pena: number,
  reincidente: boolean
): string {
  const anos = pena / 12;
  if (anos > 8) {
    return "Fechado";
  }
  if (anos > 4) {
    return reincidente ? "Fechado" : "Semiaberto";
  }
  return reincidente ? "Semiaberto" : "Aberto";
}

export function canSubstituirPena(
  pena: number,
  reincidente: boolean,
  crimeComViolenciaOuGraveAmeaca: boolean
): boolean {
  const anos = pena / 12;
  if (crimeComViolenciaOuGraveAmeaca) return false;
  if (anos > 4) return false;
  if (reincidente) return false;
  return true;
}

export function canSursis(
  pena: number,
  reincidenteEmCrimeDoloso: boolean,
  podeSubstituir: boolean
): boolean {
  if (podeSubstituir) return false;

  const anos = pena / 12;
  if (anos > 2) return false;
  if (reincidenteEmCrimeDoloso) return false;
  return true;
}

export function calculatePrescription(
  penaMaxima: number,
  causasInterruptivas: boolean
): number {
  let prazo = 0;
  if (penaMaxima > 12 * 12) prazo = 20 * 12;
  else if (penaMaxima > 8 * 12) prazo = 16 * 12;
  else if (penaMaxima > 4 * 12) prazo = 12 * 12;
  else if (penaMaxima > 2 * 12) prazo = 8 * 12;
  else if (penaMaxima > 1 * 12) prazo = 4 * 12;
  else prazo = 3 * 12;

  if (causasInterruptivas) {
    prazo = prazo / 2;
  }

  return prazo;
}

export function calculateProgression(
  pena: number,
  reincidente: boolean,
  crimeComViolenciaOuGraveAmeaca: boolean,
  crimeHediondoOuEquiparado: boolean,
  resultadoMorte: boolean,
  feminicidio: boolean
): { fracao: number; tempo: number } {
  let fracao = 0;

  if (feminicidio && !reincidente) {
    fracao = 0.55;
  } else if (reincidente) {
    if (crimeHediondoOuEquiparado) {
      fracao = resultadoMorte ? 0.7 : 0.6;
    } else if (crimeComViolenciaOuGraveAmeaca) {
      fracao = 0.3;
    } else {
      fracao = 0.2;
    }
  } else {
    if (crimeHediondoOuEquiparado) {
      fracao = resultadoMorte ? 0.5 : 0.4;
    } else if (crimeComViolenciaOuGraveAmeaca) {
      fracao = 0.25;
    } else {
      fracao = 0.16;
    }
  }

  return { fracao, tempo: pena * fracao };
}

export function calculateAllProgressions(
  penaTotalMeses: number,
  fracao: number,
  regimeInicial: string
): { regime: string; tempoCumprir: number; penaRestante: number }[] {
  if (
    penaTotalMeses <= 0 ||
    fracao <= 0 ||
    fracao >= 1 ||
    regimeInicial === "Aberto"
  ) {
    return [];
  }

  const progressoes = [];
  let penaRestante = penaTotalMeses;

  if (regimeInicial === "Fechado") {
    const tempoParaSemiaberto = penaRestante * fracao;
    penaRestante -= tempoParaSemiaberto;
    progressoes.push({
      regime: "Semiaberto",
      tempoCumprir: tempoParaSemiaberto,
      penaRestante: penaRestante,
    });
  }

  if (regimeInicial === "Fechado" || regimeInicial === "Semiaberto") {
    if (penaRestante > 0) {
      const tempoParaAberto = penaRestante * fracao;
      penaRestante -= tempoParaAberto;
      progressoes.push({
        regime: "Aberto",
        tempoCumprir: tempoParaAberto,
        penaRestante: penaRestante,
      });
    }
  }

  return progressoes;
}

export function calculateLivramentoCondicional(
  pena: number,
  reincidente: boolean,
  crimeHediondo: boolean
): { fracao: number; tempo: number; data?: Date } | null {
  const anos = pena / 12;
  if (anos <= 2) {
    return null; // Não há livramento para penas de até 2 anos
  }

  let fracao = 0;

  if (reincidente && crimeHediondo) {
    return null; // VEDADO
  } else if (crimeHediondo) {
    fracao = 2 / 3;
  } else if (reincidente) {
    fracao = 1 / 2;
  } else {
    fracao = 1 / 3;
  }

  return { fracao, tempo: pena * fracao };
}

import { CrimeState } from "@/app/contexts/DosimetryProvider";

export type Causa = {
  id: string;
  artigo: string;
  descricao: string;
  tipo: string;
  valor: {
    tipo: "fracao" | "multiplicador" | "range" | "dobro" | "triplo";
    valor?: number;
    min?: number;
    max?: number;
    fracao?: string;
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
  const parts = fracao.split("/");
  if (parts.length === 2) {
    const numerator = parseInt(parts[0], 10);
    const denominator = parseInt(parts[1], 10);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }
  return 0; // Retorna 0 se a fração for inválida
}
/**
 * Calcula a pena-base considerando as circunstâncias judiciais.
 * Aumenta a pena em 1/6 da pena-base para cada circunstância desfavorável.
 */
export function calculatePhaseOne(
  penaBase: number,
  circunstancias: Circunstancia[]
): number {
  const aumentoTotal = circunstancias.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    return acc + fracao * penaBase;
  }, 0);
  return penaBase + aumentoTotal;
}

/**
 * Calcula a pena provisória aplicando agravantes e atenuantes.
 * Aumenta ou diminui a pena em 1/6 para cada fator, com base na pena da primeira fase.
 */
export function calculatePhaseTwo(
  penaPrimeiraFase: number,
  agravantes: Circunstancia[],
  atenuantes: Circunstancia[]
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

  return penaProvisoria;
}

/**
 * Calcula a pena definitiva aplicando causas de aumento e diminuição
 * em cascata sobre a pena provisória.
 */
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
    let fracao: number;
    if (typeof causaAplicada.valorAplicado === "string") {
      fracao = parseFraction(causaAplicada.valorAplicado);
    } else {
      fracao = causaAplicada.valorAplicado;
    }
    switch (causaInfo.valor.tipo) {
      case "fracao":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual += penaAtual * causaInfo.valor.valor;
        }
        break;
      case "multiplicador":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual *= causaInfo.valor.valor;
        }
        break;
      case "range":
        penaAtual += penaAtual * fracao;
        break;
      case "dobro":
        penaAtual *= 2;
        break;
      case "triplo":
        penaAtual *= 3;
        break;
    }
  });

  causasDiminuicao.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;
    let fracao: number;
    if (typeof causaAplicada.valorAplicado === "string") {
      fracao = parseFraction(causaAplicada.valorAplicado);
    } else {
      fracao = causaAplicada.valorAplicado;
    }
    switch (causaInfo.valor.tipo) {
      case "fracao":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual -= penaAtual * causaInfo.valor.valor;
        }
        break;
      case "multiplicador":
        if (causaInfo.valor.valor !== undefined) {
          penaAtual /= causaInfo.valor.valor;
        }
        break;
      case "range":
        penaAtual -= penaAtual * fracao;
        break;
    }
  });

  return penaAtual;
}

/**
 * Formata o valor da pena (em meses) para exibição em anos, meses e dias.
 */
export function formatPena(totalMeses: number): string {
  if (totalMeses === null || totalMeses === undefined || totalMeses < 0) {
    return "--";
  }

  const anos = Math.floor(totalMeses / 12);
  const mesesRestantes = totalMeses % 12;
  const meses = Math.floor(mesesRestantes);
  const dias = Math.round((mesesRestantes - meses) * 30);

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

  return parts.join(", ");
}

export function calculateFinalDate(startDate: Date, totalMeses: number): Date {
  const finalDate = new Date(startDate);
  finalDate.setMonth(finalDate.getMonth() + Math.floor(totalMeses));
  const decimalPart = totalMeses - Math.floor(totalMeses);
  const daysToAdd = Math.round(decimalPart * 30);
  finalDate.setDate(finalDate.getDate() + daysToAdd);
  return finalDate;
}

export function calculateMulta(
  diasMulta: number,
  valorDiaMulta: number,
  salarioMinimo: number
): number {
  return diasMulta * valorDiaMulta * salarioMinimo;
}

// Novas Funções
export function calculateConcursoMaterial(crimes: CrimeState[]): number {
  return crimes.reduce((acc, crime) => acc + (crime.penaDefinitiva || 0), 0);
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

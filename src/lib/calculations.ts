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
  if (!fracao || typeof fracao !== "string") return 0;
  const parts = fracao.split("/");
  if (parts.length === 2) {
    const numerator = parseInt(parts[0], 10);
    const denominator = parseInt(parts[1], 10);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return numerator / denominator;
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
    return acc + fracao * penaBase;
  }, 0);
  return penaBase + aumentoTotal;
}

export function calculatePhaseTwo(
  penaPrimeiraFase: number,
  agravantes: Circunstancia[],
  atenuantes: Circunstancia[],
  penaBase: number,
  penaMinima: number
): number {
  let penaProvisoria = penaPrimeiraFase;

  const aumento = agravantes.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    return acc + fracao * penaBase;
  }, 0);

  const diminuicao = atenuantes.reduce((acc, c) => {
    const fracao = parseFraction(c.fracao);
    return acc + fracao * penaBase;
  }, 0);

  penaProvisoria += aumento - diminuicao;

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
    let fracao: number;
    if (typeof causaAplicada.valorAplicado === "string") {
      fracao = parseFraction(causaAplicada.valorAplicado);
    } else {
      fracao = causaAplicada.valorAplicado;
    }
    switch (causaInfo.valor.tipo) {
      case "fracao":
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
      case "range":
        penaAtual -= penaAtual * fracao;
        break;
    }
  });

  return penaAtual;
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

  // Arredonda para 4 casas decimais para evitar imprecisões de ponto flutuante
  const totalMesesRounded = parseFloat(totalMeses.toFixed(4));

  const anos = Math.floor(totalMesesRounded / 12);
  const mesesRestantes = totalMesesRounded % 12;
  const meses = Math.floor(mesesRestantes);

  // Arredonda os dias para evitar casas decimais
  let dias = Math.round((mesesRestantes - meses) * 30);

  let mesesCorrigidos = meses;

  if (dias >= 30) {
    mesesCorrigidos += 1;
    dias = 0;
  }

  const parts = [];
  if (anos > 0) {
    parts.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  }
  if (mesesCorrigidos > 0) {
    parts.push(`${mesesCorrigidos} ${mesesCorrigidos > 1 ? "meses" : "mês"}`);
  }
  if (dias > 0) {
    parts.push(`${dias} dia${dias > 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return "0 dias";
  }

  return parts.join(" e ");
}

export function calculateFinalDate(startDate: Date, totalMeses: number): Date {
  const finalDate = new Date(startDate);
  finalDate.setMonth(finalDate.getMonth() + Math.floor(totalMeses));
  const decimalPart = totalMeses - Math.floor(totalMeses);
  const daysToAdd = Math.round(decimalPart * 30);
  finalDate.setDate(finalDate.getDate() + daysToAdd);
  return finalDate;
}

// --- Funções de Concurso de Crimes ---

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

// --- Funções de Análise de Benefícios ---

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

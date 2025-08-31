export type Causa = {
  id: string;
  artigo: string;
  descricao: string;
  tipo: string;
  valor: {
    tipo: "fracao" | "multiplicador" | "range";
    valor?: number;
    min?: number;
    max?: number;
  };
};

export type CausaAplicada = {
  id: string;
  valorAplicado: number;
};

/**
 * Calcula a pena-base considerando as circunstâncias judiciais.
 * Aumenta a pena em 1/8 por circunstância desfavorável.
 */
export function calculatePhaseOne(
  penaBase: number,
  circunstancias: string[]
): number {
  const aumentoPorCircunstancia = 1 / 8;
  const totalAumento = circunstancias.length * aumentoPorCircunstancia;
  return penaBase * (1 + totalAumento);
}

/**
 * Calcula a pena provisória aplicando agravantes e atenuantes.
 * Aumenta ou diminui a pena em 1/6 para cada fator.
 */
export function calculatePhaseTwo(
  penaPrimeiraFase: number,
  agravantes: string[],
  atenuantes: string[]
): number {
  const fracao = 1 / 6;
  let penaProvisoria = penaPrimeiraFase;

  const aumento = agravantes.length * fracao * penaPrimeiraFase;
  const diminuicao = atenuantes.length * fracao * penaPrimeiraFase;

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
        if (
          causaInfo.valor.min !== undefined &&
          causaInfo.valor.max !== undefined
        ) {
          const range = causaInfo.valor.max - causaInfo.valor.min;
          const fracao =
            causaInfo.valor.min + range * causaAplicada.valorAplicado;
          penaAtual += penaAtual * fracao;
        }
        break;
    }
  });

  causasDiminuicao.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo || !causaInfo.valor) return;

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
        if (
          causaInfo.valor.min !== undefined &&
          causaInfo.valor.max !== undefined
        ) {
          const range = causaInfo.valor.max - causaInfo.valor.min;
          const fracao =
            causaInfo.valor.min + range * causaAplicada.valorAplicado;
          penaAtual -= penaAtual * fracao;
        }
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

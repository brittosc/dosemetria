// Tipos para clareza
type Crime = {
  id: string;
  penaMinimaMeses: number;
  penaMaximaMeses: number;
};

type PhaseOneInput = {
  penaBase: number;
  circunstancias: string[];
  crime: Crime;
};

type PhaseTwoInput = {
  penaPrimeiraFase: number;
  agravantes: string[];
  atenuantes: string[];
  crime: Crime;
};

// ... (definição de tipos para PhaseThreeInput se necessário)

/**
 * Converte uma pena total em meses para uma string formatada.
 * Ex: 75 meses -> "6 anos, 3 meses e 0 dias"
 */
export function formatPena(totalMonths: number): string {
  if (isNaN(totalMonths) || totalMonths <= 0) {
    return "0 anos, 0 meses e 0 dias";
  }

  const anos = Math.floor(totalMonths / 12);
  const mesesRestantes = Math.floor(totalMonths % 12);
  // Aproxima os dias, tratando a parte decimal dos meses
  const dias = Math.round((totalMonths - Math.floor(totalMonths)) * 30);

  return `${anos} anos, ${mesesRestantes} meses e ${dias} dias`;
}

/**
 * Calcula a pena ao final da Primeira Fase (Pena-Base).
 */
export function calculatePhaseOne({
  penaBase,
  circunstancias,
  crime,
}: PhaseOneInput): number {
  const fracaoAumento = 1 / 6;
  const numCircunstancias = circunstancias.length;

  const aumento = numCircunstancias * (penaBase * fracaoAumento);
  const penaCalculada = penaBase + aumento;

  // A pena da primeira fase não pode exceder a pena máxima do crime.
  return Math.min(penaCalculada, crime.penaMaximaMeses);
}

/**
 * Calcula a pena ao final da Segunda Fase (Pena Provisória).
 */
export function calculatePhaseTwo({
  penaPrimeiraFase,
  agravantes,
  atenuantes,
  crime,
}: PhaseTwoInput): number {
  const fracao = 1 / 6;
  // A jurisprudência majoritária define que a fração de 1/6 incide sobre a pena-base, não sobre a pena da primeira fase.
  // Para simplificar aqui, vamos usar a pena da primeira fase, mas em um sistema real isso seria um ponto de debate.
  const valorFracao = penaPrimeiraFase * fracao;

  const totalAgravantes = agravantes.length * valorFracao;
  const totalAtenuantes = atenuantes.length * valorFracao;

  let penaCalculada = penaPrimeiraFase + totalAgravantes - totalAtenuantes;

  // Súmula 231 do STJ: Atenuantes não podem reduzir a pena abaixo do mínimo legal.
  if (penaCalculada < crime.penaMinimaMeses) {
    penaCalculada = crime.penaMinimaMeses;
  }

  // Agravantes também não devem ultrapassar o máximo, nesta fase.
  if (penaCalculada > crime.penaMaximaMeses) {
    penaCalculada = crime.penaMaximaMeses;
  }

  return penaCalculada;
}

/**
 * Calcula a pena ao final da Terceira Fase (Pena Definitiva).
 * A lógica aqui pode ser complexa, especialmente com múltiplas causas.
 * Esta é uma implementação simplificada.
 */
export function calculatePhaseThree(
  penaProvisoria: number,
  causasAumento: any[],
  causasDiminuicao: any[],
  causasData: any[]
): number {
  let penaAtual = penaProvisoria;

  // 1. Aplica todas as causas de aumento em cascata
  causasAumento.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo) return;

    switch (causaInfo.valor.tipo) {
      case "fracao":
        penaAtual += penaAtual * causaInfo.valor.valor;
        break;
      case "multiplicador":
        penaAtual *= causaInfo.valor.valor;
        break;
      case "range":
        // O valorAplicado (0 a 1) do slider define a fração dentro do range
        const range = causaInfo.valor.max - causaInfo.valor.min;
        const fracao =
          causaInfo.valor.min + range * causaAplicada.valorAplicado;
        penaAtual += penaAtual * fracao;
        break;
    }
  });

  // 2. Aplica todas as causas de diminuição sobre o resultado
  causasDiminuicao.forEach((causaAplicada) => {
    const causaInfo = causasData.find((c) => c.id === causaAplicada.id);
    if (!causaInfo) return;

    switch (causaInfo.valor.tipo) {
      case "fracao":
        penaAtual -= penaAtual * causaInfo.valor.valor;
        break;
      case "range":
        const range = causaInfo.valor.max - causaInfo.valor.min;
        const fracao =
          causaInfo.valor.min + range * causaAplicada.valorAplicado;
        penaAtual -= penaAtual * fracao;
        break;
    }
  });

  return penaAtual > 0 ? penaAtual : 0;
}

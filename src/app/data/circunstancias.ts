// src/app/data/circunstancias.ts

export const agravantesOptions = [
  {
    id: "reincidencia",
    label: "Reincidência (Art. 61, I)",
    description:
      "Ocorre quando o agente comete novo crime, depois de transitar em julgado a sentença que, no País ou no estrangeiro, o tenha condenado por crime anterior.",
  },
  {
    id: "motivo_futil_torpe",
    label: "Motivo fútil ou torpe (Art. 61, II, a)",
    description:
      "Motivo fútil é o insignificante, desproporcional. Motivo torpe é o motivo vil, abjeto, que causa repugnância.",
  },
  {
    id: "facilitar_crime",
    label: "Facilitar/assegurar execução de outro crime (Art. 61, II, b)",
    description:
      "Quando o crime é cometido para facilitar ou assegurar a execução, a ocultação, a impunidade ou vantagem de outro crime.",
  },
  {
    id: "traicao_emboscada",
    label: "Traição, emboscada ou dissimulação (Art. 61, II, c)",
    description:
      "Agir com deslealdade, de surpresa, ou utilizando recurso que dificultou ou tornou impossível a defesa do ofendido.",
  },
  {
    id: "meio_cruel",
    label: "Emprego de meio cruel ou perigo comum (Art. 61, II, d)",
    description:
      "Utilizar veneno, fogo, explosivo, tortura ou outro meio insidioso ou cruel, ou de que podia resultar perigo comum.",
  },
  {
    id: "contra_familia",
    label: "Contra ascendente, descendente, irmão ou cônjuge (Art. 61, II, e)",
    description:
      "Crime cometido contra pais, avós, filhos, netos, irmãos ou cônjuge/companheiro.",
  },
  {
    id: "abuso_domestico_mulher",
    label: "Abuso de autoridade ou violência doméstica (Art. 61, II, f)",
    description:
      "Com abuso de autoridade ou prevalecendo-se de relações domésticas, de coabitação ou de hospitalidade, ou com violência contra a mulher na forma da lei específica.",
  },
  {
    id: "abuso_poder_profissao",
    label: "Abuso de poder ou violação de dever (Art. 61, II, g)",
    description:
      "Com abuso de poder ou violação de dever inerente a cargo, ofício, ministério ou profissão.",
  },
  {
    id: "contra_vulneravel",
    label:
      "Contra criança, maior de 60 anos, enfermo ou grávida (Art. 61, II, h)",
    description:
      "Crime cometido contra criança, pessoa com mais de 60 anos, enfermo ou mulher grávida.",
  },
  {
    id: "sob_protecao_autoridade",
    label: "Vítima sob proteção da autoridade (Art. 61, II, i)",
    description:
      "Quando o ofendido estava sob a imediata proteção da autoridade.",
  },
  {
    id: "calamidade_publica",
    label: "Ocasião de calamidade pública (Art. 61, II, j)",
    description:
      "Em ocasião de incêndio, naufrágio, inundação ou qualquer calamidade pública, ou de desgraça particular do ofendido.",
  },
  {
    id: "embriaguez_preordenada",
    label: "Embriaguez preordenada (Art. 61, II, l)",
    description:
      "Quando o agente se embriaga propositalmente para cometer o crime.",
  },
  {
    id: "instituicao_ensino",
    label: "Em instituição de ensino (Art. 61, II, m)",
    description:
      "Crime cometido em escolas, faculdades e outras instituições de ensino.",
  },
];

export const atenuantesOptions = [
  {
    id: "menor_21_maior_70",
    label: "Menor de 21 ou maior de 70 anos (Art. 65, I)",
    description:
      "Ser o agente menor de 21, na data do fato, ou maior de 70 anos, na data da sentença.",
  },
  {
    id: "desconhecimento_lei",
    label: "Desconhecimento da lei (Art. 65, II)",
    description:
      "O desconhecimento da lei, quando inescusável, pode atenuar a pena.",
  },
  {
    id: "relevante_valor",
    label: "Relevante valor social ou moral (Art. 65, III, a)",
    description:
      "Ter o agente cometido o crime por motivo de relevante valor social ou moral.",
  },
  {
    id: "reparacao_dano",
    label: "Reparação do dano (Art. 65, III, b)",
    description:
      "Procurado, por sua espontânea vontade e com eficiência, logo após o crime, evitar-lhe ou minorar-lhe as consequências, ou ter, antes do julgamento, reparado o dano.",
  },
  {
    id: "coacao_ou_ordem_emocao",
    label: "Coação, ordem ou violenta emoção (Art. 65, III, c)",
    description:
      "Cometido o crime sob coação a que podia resistir, ou em cumprimento de ordem de autoridade superior, ou sob a influência de violenta emoção, provocada por ato injusto da vítima.",
  },
  {
    id: "confissao",
    label: "Confissão espontânea (Art. 65, III, d)",
    description:
      "Ter o agente confessado espontaneamente, perante a autoridade, a autoria do crime.",
  },
  {
    id: "influencia_multidao",
    label: "Influência de multidão em tumulto (Art. 65, III, e)",
    description:
      "Cometido o crime sob a influência de multidão em tumulto, se não o provocou.",
  },
  {
    id: "circunstancia_relevante",
    label: "Circunstância inominada (Art. 66)",
    description:
      "A pena poderá ser ainda atenuada em razão de circunstância relevante, anterior ou posterior ao crime, embora não prevista expressamente em lei.",
  },
];

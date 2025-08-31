import { useReducer, useMemo } from "react";
import crimesData from "../app/data/crimes.json";
import causasData from "../app/data/causas.json";
import {
  calculatePhaseOne,
  calculatePhaseTwo,
  calculatePhaseThree,
} from "@/lib/calculations";

// --- TIPOS E INTERFACES ---

type Crime = (typeof crimesData)[0];

interface CausaAplicada {
  id: string;
  valorAplicado: number; // 0-1 para ranges, 1 para frações/multiplicadores
}

interface DosimetryState {
  currentPhase: number;
  selectedCrimeId?: string;

  phaseOneData: {
    penaBase: number;
    circunstanciasJudiciais: string[];
    dataCrime?: Date;
  };

  phaseTwoData: {
    agravantes: string[];
    atenuantes: string[];
  };

  phaseThreeData: {
    causasAumento: CausaAplicada[];
    causasDiminuicao: CausaAplicada[];
  };

  results: {
    penaPrimeiraFase?: number;
    penaProvisoria?: number;
    penaDefinitiva?: number;
  };
}

// Ações que podem ser disparadas para atualizar o estado
type Action =
  | { type: "SET_CRIME"; payload: string }
  | {
      type: "UPDATE_PHASE_ONE";
      payload: Partial<DosimetryState["phaseOneData"]>;
    }
  | {
      type: "UPDATE_PHASE_TWO";
      payload: Partial<DosimetryState["phaseTwoData"]>;
    }
  | {
      type: "UPDATE_PHASE_THREE";
      payload: Partial<DosimetryState["phaseThreeData"]>;
    }
  | { type: "CALCULATE_AND_PROCEED" }
  | { type: "GO_TO_PHASE"; payload: number }
  | { type: "RESET" };

// --- ESTADO INICIAL ---

const initialState: DosimetryState = {
  currentPhase: 1,
  selectedCrimeId: undefined,
  phaseOneData: {
    penaBase: 0,
    circunstanciasJudiciais: [],
    dataCrime: undefined,
  },
  phaseTwoData: {
    agravantes: [],
    atenuantes: [],
  },
  phaseThreeData: {
    causasAumento: [],
    causasDiminuicao: [],
  },
  results: {},
};

// --- FUNÇÃO REDUCER ---

function dosimetryReducer(
  state: DosimetryState,
  action: Action
): DosimetryState {
  switch (action.type) {
    case "RESET":
      return initialState;

    case "SET_CRIME":
      const crime = crimesData.find((c) => c.id === action.payload);
      return {
        ...initialState,
        selectedCrimeId: action.payload,
        phaseOneData: {
          ...initialState.phaseOneData,
          // Sugestão: Iniciar a pena-base com o mínimo do crime
          penaBase: crime?.penaMinimaMeses ?? 0,
        },
      };

    case "UPDATE_PHASE_ONE":
      return {
        ...state,
        phaseOneData: { ...state.phaseOneData, ...action.payload },
      };

    case "UPDATE_PHASE_TWO":
      return {
        ...state,
        phaseTwoData: { ...state.phaseTwoData, ...action.payload },
      };

    case "UPDATE_PHASE_THREE":
      return {
        ...state,
        phaseThreeData: { ...state.phaseThreeData, ...action.payload },
      };

    case "GO_TO_PHASE":
      return { ...state, currentPhase: action.payload };

    case "CALCULATE_AND_PROCEED": {
      const { currentPhase, selectedCrimeId } = state;
      const crime = crimesData.find((c) => c.id === selectedCrimeId);
      if (!crime) return state; // Não faz nada se não houver crime selecionado

      if (currentPhase === 1) {
        const penaPrimeiraFase = calculatePhaseOne({
          penaBase: state.phaseOneData.penaBase,
          circunstancias: state.phaseOneData.circunstanciasJudiciais,
          crime,
        });
        return {
          ...state,
          results: { ...state.results, penaPrimeiraFase },
          currentPhase: 2,
        };
      }

      if (currentPhase === 2) {
        if (state.results.penaPrimeiraFase === undefined) return state;
        const penaProvisoria = calculatePhaseTwo({
          penaPrimeiraFase: state.results.penaPrimeiraFase,
          agravantes: state.phaseTwoData.agravantes,
          atenuantes: state.phaseTwoData.atenuantes,
          crime,
        });
        return {
          ...state,
          results: { ...state.results, penaProvisoria },
          currentPhase: 3,
        };
      }

      if (currentPhase === 3) {
        if (state.results.penaProvisoria === undefined) return state;
        const penaDefinitiva = calculatePhaseThree(
          state.results.penaProvisoria,
          state.phaseThreeData.causasAumento,
          state.phaseThreeData.causasDiminuicao,
          causasData
        );
        return {
          ...state,
          results: { ...state.results, penaDefinitiva },
          // Fica na fase 3 para mostrar o resultado final
        };
      }

      return state;
    }

    default:
      return state;
  }
}

// --- O HOOK CUSTOMIZADO ---

export function useDosimetryCalculator() {
  const [state, dispatch] = useReducer(dosimetryReducer, initialState);

  // Deriva dados do estado para facilitar o uso nos componentes
  const selectedCrime = useMemo(
    () => crimesData.find((crime) => crime.id === state.selectedCrimeId),
    [state.selectedCrimeId]
  );

  // Funções "açucaradas" para não expor o dispatch diretamente aos componentes
  const actions = useMemo(
    () => ({
      setCrime: (crimeId: string) =>
        dispatch({ type: "SET_CRIME", payload: crimeId }),
      updatePhaseOne: (data: Partial<DosimetryState["phaseOneData"]>) =>
        dispatch({ type: "UPDATE_PHASE_ONE", payload: data }),
      updatePhaseTwo: (data: Partial<DosimetryState["phaseTwoData"]>) =>
        dispatch({ type: "UPDATE_PHASE_TWO", payload: data }),
      updatePhaseThree: (data: Partial<DosimetryState["phaseThreeData"]>) =>
        dispatch({ type: "UPDATE_PHASE_THREE", payload: data }),
      calculateAndProceed: () => dispatch({ type: "CALCULATE_AND_PROCEED" }),
      goToPhase: (phase: number) =>
        dispatch({ type: "GO_TO_PHASE", payload: phase }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  );

  return { state, actions, selectedCrime, crimesData, causasData };
}

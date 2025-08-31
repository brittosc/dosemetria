import { useReducer, useMemo } from "react";
import crimesData from "../app/data/crimes.json";
import causasDataRaw from "../app/data/causas.json";
import { calculatePhaseThree, Causa, CausaAplicada } from "@/lib/calculations";

// --- TIPOS E INTERFACES ---

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

// Ações do reducer
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

// Estado inicial
const initialState: DosimetryState = {
  currentPhase: 1,
  selectedCrimeId: undefined,
  phaseOneData: {
    penaBase: 0,
    circunstanciasJudiciais: [],
    dataCrime: undefined,
  },
  phaseTwoData: { agravantes: [], atenuantes: [] },
  phaseThreeData: { causasAumento: [], causasDiminuicao: [] },
  results: {},
};

// --- Reducer ---
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
      if (
        state.currentPhase === 3 &&
        state.results.penaProvisoria !== undefined
      ) {
        const penaDefinitiva = calculatePhaseThree(
          state.results.penaProvisoria,
          state.phaseThreeData.causasAumento,
          state.phaseThreeData.causasDiminuicao,
          causasDataRaw as Causa[]
        );
        return { ...state, results: { ...state.results, penaDefinitiva } };
      }
      return state;
    }

    default:
      return state;
  }
}

// --- Hook customizado ---
export function useDosimetryCalculator() {
  const [state, dispatch] = useReducer(dosimetryReducer, initialState);

  const selectedCrime = useMemo(
    () => crimesData.find((crime) => crime.id === state.selectedCrimeId),
    [state.selectedCrimeId]
  );

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

  // Tipagem correta para causasData
  const causasData = causasDataRaw as Causa[];

  return { state, actions, selectedCrime, crimesData, causasData };
}

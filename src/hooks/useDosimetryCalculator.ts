import { useContext, useMemo } from "react";
import crimesDataRaw from "@/app/data/crimes.json";
import causasDataRaw from "@/app/data/causas.json";
import { Causa } from "@/lib/calculations";
import {
  DosimetryContext,
  DosimetryState,
} from "@/app/contexts/DosimetryProvider";
import { Crime } from "@/types/crime";

const crimesData: Crime[] = crimesDataRaw as Crime[];

export function useDosimetryCalculator() {
  const context = useContext(DosimetryContext);
  if (!context) {
    throw new Error(
      "useDosimetryCalculator must be used within a DosimetryProvider"
    );
  }
  const { state, dispatch } = context;

  const selectedCrime: Crime | undefined = useMemo(
    () => crimesData.find((crime) => crime.id === state.selectedCrimeId),
    [state.selectedCrimeId]
  );

  const actions = useMemo(
    () => ({
      setCrime: (crimeId: string) =>
        dispatch({ type: "SET_CRIME", payload: crimeId }),
      setQualificadora: (qualificadoraId?: string) =>
        dispatch({ type: "SET_QUALIFICADORA", payload: qualificadoraId }),
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
    [dispatch]
  );

  const causasData = causasDataRaw as Causa[];

  return { state, actions, selectedCrime, crimesData, causasData };
}

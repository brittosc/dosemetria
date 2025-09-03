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
    () => crimesData.find((crime) => crime.id === state.crimes[0]?.crimeId),
    [state.crimes]
  );

  const actions = useMemo(
    () => ({
      addCrime: () => dispatch({ type: "ADD_CRIME" }),
      removeCrime: (id: string) =>
        dispatch({ type: "REMOVE_CRIME", payload: id }),
      updateCrime: (
        payload: Partial<DosimetryState["crimes"][0]> & { id: string }
      ) => dispatch({ type: "UPDATE_CRIME", payload }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    [dispatch]
  );

  const causasData = causasDataRaw as Causa[];

  return { state, dispatch, actions, selectedCrime, crimesData, causasData };
}

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";
import { ZodError } from "zod";

import { useSessionStorageState } from "../shared/hooks/usePersistedState";
import {
  InntektsmeldingSkjemaState,
  InntektsmeldingSkjemaStateValid,
} from "./frontendSchemas";
import {
  InntektsmeldingSkjemaStateSchema,
  InntektsmeldingSkjemaStateSchemaValidated,
} from "./frontendSchemas";

type InntektsmeldingSkjemaStateContextType = {
  gyldigInntektsmeldingSkjemaState?: InntektsmeldingSkjemaStateValid;
  inntektsmeldingSkjemaStateError?: ZodError;
  inntektsmeldingSkjemaState: InntektsmeldingSkjemaState;
  setInntektsmeldingSkjemaState: Dispatch<
    SetStateAction<InntektsmeldingSkjemaState>
  >;
};
const InntektsmeldingSkjemaStateContext =
  createContext<InntektsmeldingSkjemaStateContextType | null>(null);

type InntektsmeldingSkjemaStateProviderProps = {
  skjemaId: string;
  children: ReactNode;
};

const defaultSkjemaState = {
  inntekt: 0,
  refusjon: [],
  bortfaltNaturalytelsePerioder: [],
  endringAvInntektÅrsaker: [],
} satisfies InntektsmeldingSkjemaState;

export const InntektsmeldingSkjemaStateProvider = ({
  skjemaId,
  children,
}: InntektsmeldingSkjemaStateProviderProps) => {
  const [state, setState] = useSessionStorageState<InntektsmeldingSkjemaState>(
    `skjemadata-${skjemaId}`,
    defaultSkjemaState,
    InntektsmeldingSkjemaStateSchema,
  );

  const gyldigInntektsmeldingSkjemaState =
    InntektsmeldingSkjemaStateSchemaValidated.safeParse(state);

  return (
    <InntektsmeldingSkjemaStateContext.Provider
      value={{
        inntektsmeldingSkjemaState: state,
        gyldigInntektsmeldingSkjemaState: gyldigInntektsmeldingSkjemaState.data,
        inntektsmeldingSkjemaStateError: gyldigInntektsmeldingSkjemaState.error,
        setInntektsmeldingSkjemaState: setState,
      }}
    >
      {children}
    </InntektsmeldingSkjemaStateContext.Provider>
  );
};

/** Henter ut global skjematilstand, og lar deg manipulere den */
export const useInntektsmeldingSkjema = () => {
  const context = useContext(InntektsmeldingSkjemaStateContext);
  if (!context) {
    throw new Error(
      "useInntektsmeldingSkjema må brukes inne i en InntektsmeldingSkjemaStateProvider",
    );
  }

  return context;
};

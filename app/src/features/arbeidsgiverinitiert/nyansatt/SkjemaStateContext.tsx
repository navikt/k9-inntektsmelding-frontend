import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";
import { ZodError } from "zod";

import { ARBEIDSGIVERINITERT_NYANSATT_ID } from "~/routes/opprett";
import { logDev } from "~/utils";

import { useOpplysninger } from "../../shared/hooks/useOpplysninger.tsx";
import { useSessionStorageState } from "../../shared/hooks/usePersistedState.tsx";
import {
  AGIValidatedInntektsmeldingNyansatt,
  InntektsmeldingSkjemaStateAGINyansatt,
  InntektsmeldingSkjemaStateValidAGINyansatt,
} from "./zodSchemas.tsx";
import { InntektsmeldingSkjemaStateSchemaNyansatt } from "./zodSchemas.tsx";

type InntektsmeldingSkjemaStateContextTypeAGI = {
  gyldigInntektsmeldingSkjemaState?: InntektsmeldingSkjemaStateValidAGINyansatt;
  inntektsmeldingSkjemaStateError?: ZodError;
  inntektsmeldingSkjemaState: InntektsmeldingSkjemaStateAGINyansatt;
  setInntektsmeldingSkjemaState: Dispatch<
    SetStateAction<InntektsmeldingSkjemaStateAGINyansatt>
  >;
};
const InntektsmeldingSkjemaStateContextAGI =
  createContext<InntektsmeldingSkjemaStateContextTypeAGI | null>(null);

type InntektsmeldingSkjemaStateProviderProps = {
  skjemaId: string;
  children: ReactNode;
};

const defaultSkjemaState = () => {
  const { innsender } = useOpplysninger();
  return {
    kontaktperson: {
      navn: innsender.fornavn + " " + innsender.etternavn,
      telefonnummer: "",
    },
    refusjon: [],
  } satisfies InntektsmeldingSkjemaStateAGINyansatt;
};

export const InntektsmeldingSkjemaStateProviderAGINyansatt = ({
  children,
}: InntektsmeldingSkjemaStateProviderProps) => {
  const [state, setState] =
    useSessionStorageState<InntektsmeldingSkjemaStateAGINyansatt>(
      "skjemadata-" + ARBEIDSGIVERINITERT_NYANSATT_ID,
      defaultSkjemaState(),
      InntektsmeldingSkjemaStateSchemaNyansatt,
    );

  const gyldigInntektsmeldingSkjemaState =
    AGIValidatedInntektsmeldingNyansatt.safeParse(state);

  if (!gyldigInntektsmeldingSkjemaState.success) {
    logDev("error", gyldigInntektsmeldingSkjemaState.error);
  }

  return (
    <InntektsmeldingSkjemaStateContextAGI.Provider
      value={{
        inntektsmeldingSkjemaState: state,
        gyldigInntektsmeldingSkjemaState: gyldigInntektsmeldingSkjemaState.data,
        inntektsmeldingSkjemaStateError: gyldigInntektsmeldingSkjemaState.error,
        setInntektsmeldingSkjemaState: setState,
      }}
    >
      {children}
    </InntektsmeldingSkjemaStateContextAGI.Provider>
  );
};

/** Henter ut global skjematilstand, og lar deg manipulere den */
export const useInntektsmeldingSkjemaAGINyansatt = () => {
  const context = useContext(InntektsmeldingSkjemaStateContextAGI);
  if (!context) {
    throw new Error(
      "useInntektsmeldingSkjemaAGI må brukes inne i en InntektsmeldingSkjemaStateProviderAGI",
    );
  }

  return context;
};

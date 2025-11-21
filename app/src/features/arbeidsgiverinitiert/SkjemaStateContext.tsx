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

import { useOpplysninger } from "../shared/hooks/useOpplysninger.tsx";
import { useSessionStorageState } from "../shared/hooks/usePersistedState.tsx";
import {
  AGIValidatedInntektsmelding,
  InntektsmeldingSkjemaStateAGI,
  InntektsmeldingSkjemaStateValidAGI,
} from "./zodSchemas.tsx";
import { InntektsmeldingSkjemaStateSchema } from "./zodSchemas.tsx";

type InntektsmeldingSkjemaStateContextTypeAGI = {
  gyldigInntektsmeldingSkjemaState?: InntektsmeldingSkjemaStateValidAGI;
  inntektsmeldingSkjemaStateError?: ZodError;
  inntektsmeldingSkjemaState: InntektsmeldingSkjemaStateAGI;
  setInntektsmeldingSkjemaState: Dispatch<
    SetStateAction<InntektsmeldingSkjemaStateAGI>
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
  } satisfies InntektsmeldingSkjemaStateAGI;
};

export const InntektsmeldingSkjemaStateProviderAGI = ({
  children,
}: InntektsmeldingSkjemaStateProviderProps) => {
  const [state, setState] =
    useSessionStorageState<InntektsmeldingSkjemaStateAGI>(
      "skjemadata-" + ARBEIDSGIVERINITERT_NYANSATT_ID,
      defaultSkjemaState(),
      InntektsmeldingSkjemaStateSchema,
    );

  const gyldigInntektsmeldingSkjemaState =
    AGIValidatedInntektsmelding.safeParse(state);

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
export const useInntektsmeldingSkjemaAGI = () => {
  const context = useContext(InntektsmeldingSkjemaStateContextAGI);
  if (!context) {
    throw new Error(
      "useInntektsmeldingSkjemaAGI må brukes inne i en InntektsmeldingSkjemaStateProviderAGI",
    );
  }

  return context;
};

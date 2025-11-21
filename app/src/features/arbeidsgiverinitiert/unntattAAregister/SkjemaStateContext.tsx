import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from "react";
import { ZodError } from "zod";

import { ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID } from "~/routes/opprett";
import { logDev } from "~/utils";

import { useSessionStorageState } from "../../shared/hooks/usePersistedState.tsx";
import {
  AGIValidatedInntektsmeldingUnntattAaregister,
  InntektsmeldingSkjemaStateAGIUnntattAaregister,
  InntektsmeldingSkjemaStateSchemaUnntattAaregister,
  InntektsmeldingSkjemaStateValidAGIUnntattAaregister,
} from "./zodSchemas.tsx";

type InntektsmeldingSkjemaStateContextTypeAGIUnntattAaregister = {
  gyldigInntektsmeldingSkjemaState?: InntektsmeldingSkjemaStateValidAGIUnntattAaregister;
  inntektsmeldingSkjemaStateError?: ZodError;
  inntektsmeldingSkjemaState: InntektsmeldingSkjemaStateAGIUnntattAaregister;
  setInntektsmeldingSkjemaState: Dispatch<
    SetStateAction<InntektsmeldingSkjemaStateAGIUnntattAaregister>
  >;
};
const InntektsmeldingSkjemaStateContextAGIUnntattAaregister =
  createContext<InntektsmeldingSkjemaStateContextTypeAGIUnntattAaregister | null>(
    null,
  );

type InntektsmeldingSkjemaStateProviderProps = {
  skjemaId: string;
  children: ReactNode;
};

const defaultSkjemaState = () => {
  return {
    inntekt: 0,
    refusjon: [],
    bortfaltNaturalytelsePerioder: [],
    endringAvInntektÅrsaker: [],
  } satisfies InntektsmeldingSkjemaStateAGIUnntattAaregister;
};

export const InntektsmeldingSkjemaStateProviderAGIUnntattAaregister = ({
  children,
}: InntektsmeldingSkjemaStateProviderProps) => {
  const [state, setState] =
    useSessionStorageState<InntektsmeldingSkjemaStateAGIUnntattAaregister>(
      "skjemadata-" + ARBEIDSGIVERINITIERT_UNNTATT_AAREGISTER_ID,
      defaultSkjemaState(),
      InntektsmeldingSkjemaStateSchemaUnntattAaregister,
    );

  const gyldigInntektsmeldingSkjemaState =
    AGIValidatedInntektsmeldingUnntattAaregister.safeParse(state);

  if (!gyldigInntektsmeldingSkjemaState.success) {
    logDev("error", gyldigInntektsmeldingSkjemaState.error);
  }

  return (
    <InntektsmeldingSkjemaStateContextAGIUnntattAaregister.Provider
      value={{
        inntektsmeldingSkjemaState: state,
        gyldigInntektsmeldingSkjemaState: gyldigInntektsmeldingSkjemaState.data,
        inntektsmeldingSkjemaStateError: gyldigInntektsmeldingSkjemaState.error,
        setInntektsmeldingSkjemaState: setState,
      }}
    >
      {children}
    </InntektsmeldingSkjemaStateContextAGIUnntattAaregister.Provider>
  );
};

/** Henter ut global skjematilstand, og lar deg manipulere den */
export const useInntektsmeldingSkjemaAGIUnntattAaregister = () => {
  const context = useContext(
    InntektsmeldingSkjemaStateContextAGIUnntattAaregister,
  );
  if (!context) {
    throw new Error(
      "useInntektsmeldingSkjemaAGIUnntattAaregister må brukes inne i en InntektsmeldingSkjemaStateProviderAGIUnntattAaregister",
    );
  }

  return context;
};

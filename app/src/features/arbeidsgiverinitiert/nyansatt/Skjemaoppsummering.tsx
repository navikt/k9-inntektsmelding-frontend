import { OpplysningerDto } from "~/types/api-schemas";

import {
  ArbeidsgiverOgAnsattOppsummering,
  RefusjonOppsummering,
  UtbetalingOgRefusjonOppsummering,
} from "../../inntektsmelding/visningskomponenter/Skjemaoppsummering.tsx";
import { InntektsmeldingSkjemaStateValidAGINyansatt } from "./frontendSchemas.tsx";

export const Skjemaoppsummering = ({
  opplysninger,
  gyldigInntektsmeldingSkjemaState,
}: {
  opplysninger: OpplysningerDto;
  gyldigInntektsmeldingSkjemaState: InntektsmeldingSkjemaStateValidAGINyansatt;
}) => {
  return (
    <>
      <ArbeidsgiverOgAnsattOppsummering
        editPath="/agi/$id/dine-opplysninger"
        kanEndres={true}
        opplysninger={opplysninger}
        skjemaState={gyldigInntektsmeldingSkjemaState}
      />
      <RefusjonOppsummering
        editPath="/agi/$id/refusjon"
        kanEndres={true}
        opplysninger={opplysninger}
        startdato={gyldigInntektsmeldingSkjemaState.førsteFraværsdag}
      />
      <UtbetalingOgRefusjonOppsummering
        editPath="/agi/$id/refusjon"
        kanEndres={true}
        skjemaState={gyldigInntektsmeldingSkjemaState}
      />
    </>
  );
};

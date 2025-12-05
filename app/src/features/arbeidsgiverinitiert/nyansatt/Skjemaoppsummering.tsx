import { OpplysningerDto } from "~/types/api-models";

import {
  ArbeidsgiverOgAnsattOppsummering,
  RefusjonOppsummering,
  UtbetalingOgRefusjonOppsummering,
} from "../../inntektsmelding/visningskomponenter/Skjemaoppsummering.tsx";
import { InntektsmeldingSkjemaStateValidAGINyansatt } from "./zodSchemas.tsx";

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

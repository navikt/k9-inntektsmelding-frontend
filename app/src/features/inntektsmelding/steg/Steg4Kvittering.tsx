import { getRouteApi } from "@tanstack/react-router";

import { useInntektsmeldingSkjema } from "~/features/inntektsmelding/SkjemaStateContext";
import { useStartPåNyttSteg } from "~/features/shared/hooks/useStartPåNyttSteg";

import { useOpplysninger } from "../../shared/hooks/useOpplysninger";
import { Kvittering } from "../../shared/skjema-moduler/steg/Kvittering";

const route = getRouteApi("/$id");

export const Steg4Kvittering = () => {
  useStartPåNyttSteg();
  const { id } = route.useParams();
  const opplysninger = useOpplysninger();
  const { gyldigInntektsmeldingSkjemaState } = useInntektsmeldingSkjema();

  return (
    <Kvittering
      breadcrumbUrl={`/${id}/kvittering`}
      inntektsmeldingsId={gyldigInntektsmeldingSkjemaState?.id}
      opplysninger={opplysninger}
      skalRefunderes={gyldigInntektsmeldingSkjemaState?.skalRefunderes}
    />
  );
};

import { useOpplysninger } from "../../../shared/hooks/useOpplysninger";
import { Kvittering } from "../../../shared/skjema-moduler/steg/Kvittering";
import { useInntektsmeldingSkjemaAGIUnntattAaRegister } from "../SkjemaStateContext";

export const Steg4Kvittering = () => {
  const opplysninger = useOpplysninger();
  const { gyldigInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjemaAGIUnntattAaRegister();

  return (
    <Kvittering
      breadcrumbUrl="/agi-unntatt-aaregister/$id/kvittering"
      inntektsmeldingsId={gyldigInntektsmeldingSkjemaState?.id}
      opplysninger={opplysninger}
      skalRefunderes={gyldigInntektsmeldingSkjemaState?.skalRefunderes}
    />
  );
};

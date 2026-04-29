import { createFileRoute, redirect } from "@tanstack/react-router";

import { hentEksisterendeInntektsmeldinger } from "~/api/queries";

export const Route = createFileRoute("/$id/")({
  loader: async ({ params, parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise;
    const opplysninger = loaderData?.opplysninger;
    if (!opplysninger) {
      throw new Error("No loader data");
    }

    if (opplysninger.forespørselType === "ARBEIDSGIVERINITIERT_NYANSATT") {
      return redirect({
        to: "/agi/$id/vis",
        params: {
          id: params.id,
        },
        replace: true,
        throw: true,
      });
    }

    if (opplysninger.forespørselType === "ARBEIDSGIVERINITIERT_UREGISTRERT") {
      return redirect({
        to: "/agi-unntatt-aaregister/$id/vis",
        params: {
          id: params.id,
        },
        replace: true,
        throw: true,
      });
    }

    const eksisterendeInntektsmeldinger =
      await hentEksisterendeInntektsmeldinger(params.id);
    const harEksisterende = eksisterendeInntektsmeldinger.length > 0;
    const harSendtInn = eksisterendeInntektsmeldinger.some(
      (im) => im.opprettetTidspunkt !== undefined,
    );

    if (opplysninger.forespørselStatus === "UTGÅTT" && !harEksisterende) {
      throw new Error("OPPGAVE_ER_UTGÅTT");
    }

    if (harSendtInn) {
      redirect({
        to: "/$id/vis",
        params,
        replace: true,
        throw: true,
      });
    } else {
      redirect({
        to: "/$id/dine-opplysninger",
        params,
        replace: true,
        throw: true,
      });
    }

    return {
      opplysninger,
      eksisterendeInntektsmeldinger,
    };
  },
  component: () => null,
});

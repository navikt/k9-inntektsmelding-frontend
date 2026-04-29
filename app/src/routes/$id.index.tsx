import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$id/")({
  loader: async ({ parentMatchPromise, params }) => {
    const { loaderData } = await parentMatchPromise;
    const opplysninger = loaderData?.opplysninger;
    const eksisterendeInntektsmeldinger =
      loaderData?.eksisterendeInntektsmeldinger;
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

    if (!eksisterendeInntektsmeldinger) {
      throw new Error("No loader data");
    }

    const harSendtInn = eksisterendeInntektsmeldinger.some(
      (im) => im.opprettetTidspunkt !== undefined,
    );

    if (harSendtInn) {
      redirect({
        to: "/$id/vis",
        params: { id: params.id },
        replace: true,
        throw: true,
      });
    } else {
      redirect({
        to: "/$id/dine-opplysninger",
        params: { id: params.id },
        replace: true,
        throw: true,
      });
    }
  },
  component: () => null,
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$id/")({
  loader: async ({ params, parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise;
    const eksisterendeInntektsmeldinger =
      loaderData?.eksisterendeInntektsmeldinger;
    const opplysninger = loaderData?.opplysninger;
    if (!eksisterendeInntektsmeldinger || !opplysninger) {
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

    if (eksisterendeInntektsmeldinger[0] === undefined) {
      redirect({
        to: "/$id/dine-opplysninger",
        params,
        replace: true,
        throw: true,
      });
    } else {
      redirect({
        to: "/$id/vis",
        params,
        replace: true,
        throw: true,
      });
    }
  },
  component: () => null,
});

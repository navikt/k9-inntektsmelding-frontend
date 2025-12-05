import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/agi-unntatt-aaregister/$id/")({
  loader: async ({ params, parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise;
    const eksisterendeInntektsmeldinger =
      loaderData?.eksisterendeInntektsmeldinger;
    const opplysninger = loaderData?.opplysninger;
    if (!eksisterendeInntektsmeldinger || !opplysninger) {
      throw new Error("No loader data");
    }

    if (eksisterendeInntektsmeldinger[0] === undefined) {
      redirect({
        to: "/agi-unntatt-aaregister/$id/dine-opplysninger",
        params,
        replace: true,
        throw: true,
      });
    } else {
      redirect({
        to: "/agi-unntatt-aaregister/$id/vis",
        params,
        replace: true,
        throw: true,
      });
    }
  },
  component: () => null,
});

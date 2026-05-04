import { expect, test } from "@playwright/test";
import { mangeEksisterendeInntektsmeldingerResponse } from "tests/mocks/inntektsmelding/eksisterende-inntektsmeldinger";
import { enkeltOpplysningerResponse } from "tests/mocks/inntektsmelding/opplysninger";
import {
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

const FORESPORSEL_UUID = "im-vis-test-uuid";

test.describe("Inntektsmelding – vis-rute", () => {
  test("Viser innsendt inntektsmelding fra loader", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: enkeltOpplysningerResponse,
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: mangeEksisterendeInntektsmeldingerResponse,
    });

    await page.goto(`/k9-im-dialog/${FORESPORSEL_UUID}/vis`);

    await expect(
      page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
    ).toBeVisible();

    // Arbeidsgiver og den ansatte
    await expect(page.getByText("Arbeidsgiver og den ansatte")).toBeVisible();
    await expect(
      page.getByText("Papir- og pappvareproduksjon el.").first(),
    ).toBeVisible();
    await expect(page.getByText("Berømt Flyttelass").first()).toBeVisible();
    await expect(page.getByText("12 31 23 12").first()).toBeVisible();
    await expect(
      page.getByText("Underfundig Dyreflokk", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("275278 27812", { exact: false }),
    ).toBeVisible();

    // Første fraværsdag
    await expect(page.getByText(/31. mai 2024/)).toBeVisible();

    // Månedslønn med endringsårsaker
    await expect(page.getByText("Beregnet månedslønn")).toBeVisible();
    await expect(page.getByText("Ferie")).toBeVisible();
    await expect(page.getByText("Permisjon")).toBeVisible();

    // Utbetaling og refusjon
    await expect(
      page.getByText("Ja, men kun deler av perioden eller varierende beløp"),
    ).toBeVisible();

    // Org.nr
    await expect(
      page.getByText("810007842", { exact: false }).first(),
    ).toBeVisible();

    // Inntekt – endret
    await expect(page.getByText("Endret til:", { exact: false })).toBeVisible();

    // Refusjonsbeløp med dato (varierende refusjon)
    await expect(page.getByText("80 kr", { exact: false })).toBeVisible();
    await expect(page.getByText(/25. oktober 2024/)).toBeVisible();

    // Naturalytelser
    await expect(page.getByText("Naturalytelser").first()).toBeVisible();
    await expect(page.getByText("Losji")).toBeVisible();
    await expect(page.getByText("50 kr", { exact: false })).toBeVisible();
    await expect(page.getByText(/12\.09\.2024/)).toBeVisible();

    await expect(page.getByText("Last ned inntektsmeldingen")).toBeVisible();
  });

  test("Viser advarsel når forespørsel er UTGÅTT", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: {
        ...enkeltOpplysningerResponse,
        forespørselStatus: "UTGÅTT" as const,
      },
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: mangeEksisterendeInntektsmeldingerResponse,
    });

    await page.goto(`/k9-im-dialog/${FORESPORSEL_UUID}/vis`);

    await expect(
      page.getByText(
        "Du kan ikke endre inntektsmeldingen når oppgaven den er knyttet til er utgått",
        { exact: false },
      ),
    ).toBeVisible();
  });
});

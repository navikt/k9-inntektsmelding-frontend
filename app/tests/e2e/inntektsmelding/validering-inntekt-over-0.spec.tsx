import { expect, test } from "@playwright/test";
import { enkeltOpplysningerResponse } from "tests/mocks/inntektsmelding/opplysninger";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test.describe("Validering av inntekt", () => {
  test("Skal gi feilmelding hvis inntekt er 0 og man ikke har endret månedslønn", async ({
    page,
  }) => {
    // 1. Mock data med 0 i inntekt
    const opplysningerMed0Inntekt = {
      ...enkeltOpplysningerResponse,
      inntektsopplysninger: {
        ...enkeltOpplysningerResponse.inntektsopplysninger,
        gjennomsnittLønn: 0,
        månedsinntekter:
          enkeltOpplysningerResponse.inntektsopplysninger.månedsinntekter.map(
            (inntekt) => ({ ...inntekt, beløp: 0 }),
          ),
      },
    };

    await mockOpplysninger({ page, json: opplysningerMed0Inntekt });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });

    // 2. Gå til "Inntekt og refusjon" steget
    // Vi må først gjennom dine-opplysninger for å komme dit i en realistisk flow,
    // eller vi kan gå direkte hvis appen tillater det. Appen tillater deep-linking.
    await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

    // Vent på at siden laster
    await expect(
      page.getByRole("heading", { name: "Inntekt og refusjon" }),
    ).toBeVisible();

    // 3. Verifiser at beregnet månedslønn er 0
    const inntektBlock = page.getByTestId("gjennomsnittinntekt-block");
    await expect(inntektBlock).toBeVisible();
    await expect(inntektBlock).toContainText("0");

    // 4. Prøv å gå videre uten å gjøre endringer
    await page.getByRole("button", { name: "Neste steg" }).click();

    // 5. Verifiser feilmelding
    await expect(
      page.getByText(
        'Beløpet må være større enn kr 0. Klikk på "Endre månedslønn" for å endre inntekten.',
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: "Endre månedslønn" }).click();

    await expect(
      page.getByText(
        'Beløpet må være større enn kr 0. Klikk på "Endre månedslønn" for å endre inntekten.',
      ),
    ).not.toBeVisible();

    await page.getByRole("button", { name: "Neste steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Inntekt og refusjon" }),
    ).toBeVisible();
  });
});

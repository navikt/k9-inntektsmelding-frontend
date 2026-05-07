import { expect, test } from "@playwright/test";
import {
  finnInputFraLabel,
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

import { mangeEksisterendeInntektsmeldingerResponse } from "../../mocks/inntektsmelding/eksisterende-inntektsmeldinger";

test('burde vise "vis IM"-siden for siste innsendte IM', async ({ page }) => {
  await mockOpplysninger({
    page,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
    json: mangeEksisterendeInntektsmeldingerResponse,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });

  await page.goto("/k9-im-dialog/f29dcea7-febe-4a76-911c-ad8f6d3e8858");

  await expect(
    page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
  ).toBeVisible();
  await expect(page.getByText("Sendt inn 08.10.24 KL 13:34")).toBeVisible();

  // Skal vise 2 Endre knapper. En på topp, og en på bunn av oppsummering
  await expect(page.getByRole("button", { name: "Endre" })).toHaveCount(2);

  // Klikke endre-knapp, eller endre lenke på dine-opplysninger skal ta deg til starten av skjema.
  await page.getByRole("button", { name: "Endre" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Dine opplysninger" }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole("link", { name: "Endre dine opplysninger" }).click();

  // Sjekk ferdigutfylte verdier for dine-opplysninger
  await expect(
    await finnInputFraLabel({ page, labelText: "Navn" }),
  ).toHaveValue("Berømt Flyttelass");
  await expect(
    await finnInputFraLabel({ page, labelText: "Telefon" }),
  ).toHaveValue("12312312");
  await page.goBack();

  // Sjekk lenke til endre inntekt og utfylt info
  await page.getByRole("link", { name: "Endre inntekt" }).click();
  await expect(
    page.getByRole("heading", { name: "Beregnet månedslønn" }),
  ).toBeVisible();
  await expect(
    await finnInputFraLabel({ page, labelText: "Endret månedsinntekt" }),
  ).toHaveValue("500");
  await expect(
    await finnInputFraLabel({
      page,
      labelText: "Hva er årsaken til endringen?",
    }),
  ).toHaveValue("FERIE");
  await expect(
    await finnInputFraLabel({
      page,
      labelText: "Fra og med",
    }),
  ).toHaveValue("11.03.2024");
  await expect(
    await finnInputFraLabel({
      page,
      labelText: "Til og med",
    }),
  ).toHaveValue("25.04.2024");
  await expect(
    await finnInputFraLabel({
      page,
      nth: 1,
      labelText: "Hva er årsaken til endringen?",
    }),
  ).toHaveValue("PERMISJON");
  await expect(
    await finnInputFraLabel({
      page,
      nth: 1,
      labelText: "Fra og med",
    }),
  ).toHaveValue("11.04.2024");
  await expect(
    await finnInputFraLabel({
      page,
      nth: 1,

      labelText: "Til og med",
    }),
  ).toHaveValue("");
  await expect(
    await finnInputFraLabel({
      page,
      nth: 1,

      labelText: "Til og med",
    }),
  ).toBeDisabled();
  await expect(
    await finnInputFraLabel({
      page,
      labelText: "Ansatt er fremdeles i permisjon",
    }),
  ).toBeChecked();
  await page.goBack();

  // Sjekk lenke til utbetaling og refusjon og utfylt info
  await page
    .getByRole("link", { name: "Endre utbetaling og refusjon" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Utbetaling og refusjon" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("radiogroup", {
        name: "Betaler dere lønn under fraværet og krever refusjon?",
      })
      .getByRole("radio", {
        name: "Ja, men kun deler av perioden eller varierende beløp",
      }),
  ).toBeChecked();
  const varierendeRefusjonBlokk = page.getByTestId("varierende-refusjon");
  await expect(
    await finnInputFraLabel({
      page: varierendeRefusjonBlokk,
      nth: 0,
      labelText: "Fra og med",
    }),
  ).toHaveValue("30.05.2024");
  await expect(
    await finnInputFraLabel({
      page: varierendeRefusjonBlokk,
      nth: 0,
      labelText: "Refusjonsbeløp per måned",
    }),
  ).toHaveValue("500");
  await expect(
    await finnInputFraLabel({
      page: varierendeRefusjonBlokk,
      nth: 1,
      labelText: "Fra og med",
    }),
  ).toHaveValue("25.10.2024");
  await expect(
    await finnInputFraLabel({
      page: varierendeRefusjonBlokk,
      nth: 1,
      labelText: "Refusjonsbeløp per måned",
    }),
  ).toHaveValue("80");
  await page.goBack();

  // Sjekk lenke til naturalytelser og utfylt info
  await page.getByRole("link", { name: "Endre naturalytelser" }).click();
  await expect(
    page.getByRole("heading", { name: "Naturalytelser" }),
  ).toBeVisible();
  const naturalytelserBlokk = page.getByTestId("naturalytelser-blokk");

  await expect(
    page
      .getByRole("radiogroup", {
        name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
      })
      .getByRole("radio", { name: "Ja" }),
  ).toBeChecked();
  await expect(
    await finnInputFraLabel({
      page,
      labelText: "Naturalytelse som faller bort",
    }),
  ).toHaveValue("LOSJI");
  await expect(
    await finnInputFraLabel({
      page: naturalytelserBlokk,
      nth: 0,
      labelText: "Fra og med",
    }),
  ).toHaveValue("12.09.2024");
  await expect(
    await finnInputFraLabel({
      page: naturalytelserBlokk,
      nth: 0,
      labelText: "Fra og med",
    }),
  ).toHaveValue("12.09.2024");
  await expect(
    await finnInputFraLabel({
      page: naturalytelserBlokk,
      nth: 0,
      labelText: "Verdi pr. måned",
    }),
  ).toHaveValue("50");
  await expect(
    naturalytelserBlokk
      .getByRole("radiogroup", {
        name: "Vil naturalytelsen komme tilbake i løpet av fraværet?",
      })
      .getByRole("radio", { name: "Ja" }),
  ).toBeChecked();
  await expect(
    await finnInputFraLabel({
      page: naturalytelserBlokk,
      nth: 0,
      labelText: "Til og med",
    }),
  ).toHaveValue("12.10.2024");
});

test("sjekk at tilbakestill inntekt tilbakestiller til gjennomsnitt fra opplysningene", async ({
  page,
}) => {
  await mockOpplysninger({
    page,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
    json: mangeEksisterendeInntektsmeldingerResponse,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });

  await page.goto("/k9-im-dialog/f29dcea7-febe-4a76-911c-ad8f6d3e8858");
  await page.getByRole("link", { name: "Endre inntekt" }).click();
  await expect(
    await finnInputFraLabel({ page, labelText: "Endret månedsinntekt" }),
  ).toHaveValue("500");
  await page.getByRole("button", { name: "Tilbakestill" }).first().click();
  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("53 000"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expect(
    page.getByText("Beregnet månedslønn").locator("..").getByText("53 000 kr"),
  ).toBeVisible();
});

test("skal ikke få lov til å sende inn uten endring", async ({ page }) => {
  await mockOpplysninger({
    page,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
    json: mangeEksisterendeInntektsmeldingerResponse,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });

  await page.goto("/k9-im-dialog/f29dcea7-febe-4a76-911c-ad8f6d3e8858");
  await page.getByRole("button", { name: "Endre" }).first().click();
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
  await page.getByRole("button", { name: "Neste steg" }).click();
  await page.getByRole("button", { name: "Send inn" }).click();

  await expect(
    page.getByText(
      "Du har ikke gjort noen endringer fra forrige innsendte inntektsmelding.",
    ),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";
import {
  brukNoBreakSpaces,
  expectError,
  finnInputFraLabel,
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test("Gå igjennom skjema og test alle valideringer", async ({ page }) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  // Skal forsøke hente eksisterende inntektsmelding og navigere til første steg når IM ikke finnes.
  await page.goto("/k9-im-dialog/1");

  await expect(
    page.getByText("Underfundig Dyreflokk", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Underfundig Dyreflokk (275278 27812)"),
  ).toBeVisible();

  await expect(page.getByLabel("Navn")).toBeVisible();
  await expect(page.getByLabel("Navn")).toHaveValue("Berømt Flyttelass");
  await page.getByLabel("Navn").click();
  await page.getByLabel("Navn").fill("123123123".repeat(15));
  await page.getByText("Bekreft og gå videre").click();
  await expectError({
    page,
    label: "Navn",
    error: "Navn kan ikke være lenger enn 100 tegn",
  });
  await expectError({
    page,
    label: "Telefon",
    error: "Telefonnummer er påkrevd",
  });

  await page.getByLabel("Navn").clear();
  await page.getByLabel("Navn").fill("Berømt Flyttelass");
  await page.getByLabel("Telefon").fill("12312312");
  await page.getByText("Bekreft og gå videre").click();

  // Inntekt og refusjon siden
  await expect(
    page.getByRole("heading", { name: "Inntekt og refusjon" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Periode med pleiepenger" }),
  ).toBeVisible();

  await expect(
    page.getByText("Underfundigs første dag med pleiepenger"),
  ).toBeVisible();
  await expect(page.getByText("Fra søknaden til Underfundig")).toBeVisible();
  await expect(page.getByText("Fredag 31. mai 2024")).toBeVisible();

  // Beregnet månedslønn
  await expect(
    page.getByRole("heading", { name: "Beregnet Månedslønn" }),
  ).toBeVisible();

  await expect(page.getByText("Fra A-Ordningen")).toBeVisible();
  const gjennomsnittInntektBlokk = page.getByTestId(
    "gjennomsnittinntekt-block",
  );
  await expect(
    gjennomsnittInntektBlokk.getByText("Beregnet månedslønn"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  // Prøv å submit for å trigge errors
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expectError({
    page,
    label: "Endret månedsinntekt",
    error: "Må oppgis",
  });

  await expectError({
    page,
    label: "Hva er årsaken til endringen?",
    error: "Må oppgis",
  });

  await page.getByLabel("Endret månedsinntekt").fill("-50000");
  await expectError({
    page,
    label: "Endret månedsinntekt",
    error: "Beløpet må være 0 eller høyere",
  });
  await page.getByText("Endret månedsinntekt").fill("5".repeat(21));
  await expectError({
    page,
    label: "Endret månedsinntekt",
    error: "Beløpet er for stort",
  });
  await page.getByText("Endret månedsinntekt").fill("50000");

  await page.getByLabel("Hva er årsaken til endringen?").selectOption("Ferie");

  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    label: "Fra og med",
    error: "Må oppgis",
  });

  await expectError({
    page,
    label: "Til og med",
    error: "Må oppgis",
  });

  await page.getByLabel("Fra og med").fill("01.08.2024");
  await page.getByLabel("Til og med").fill("01.08.2024"); // TODO: mangler validering på at den ikke kan være tidligere
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    label: "Fra og med",
    error: "Lønnsendring må være før første dag med fravær",
  });

  await expectError({
    page,
    label: "Til og med",
    error: "Lønnsendring må være før første dag med fravær",
  });
  await page.getByLabel("Fra og med").clear();
  await page.getByLabel("Fra og med").fill("01.04.2024");
  await page.getByLabel("Til og med").clear();
  await page.getByLabel("Til og med").fill("01.5.2024");

  await page.getByRole("button", { name: "Legg til ny endringsårsak" }).click();
  await expect(page.getByText("Hva er årsaken til endringen?")).toHaveCount(2);

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .nth(1)
    .selectOption("Ferie");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    nth: 1,
    label: "Fra og med",
    error: "Må oppgis",
  });

  await page.getByRole("button", { name: "Slett endringsårsak" }).click();
  await expect(page.getByText("Hva er årsaken til endringen?")).toHaveCount(1);

  /**
   * Test Utbetaling og Refusjon
   */
  await expectError({
    page,
    label: "Betaler dere lønn under fraværet og krever refusjon?",
    error: "Du må svare på dette spørsmålet",
  });

  /**
   * Lik refusjon
   */
  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
    .click();

  const refusjonsBlock = page
    .getByText("Refusjonsbeløp per måned")
    .locator("..");
  await expect(
    refusjonsBlock.getByText("Refusjonsbeløp per måned"),
  ).toBeVisible();
  await expect(refusjonsBlock.getByText("50 000 kr")).toBeVisible();
  await page.getByRole("button", { name: "Endre refusjonsbeløp" }).click();
  await page.getByText("Refusjonsbeløp per måned").fill("-1");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    label: "Refusjonsbeløp per måned",
    error: "Beløpet må være 0 eller høyere",
  });
  await page.getByText("Refusjonsbeløp per måned").fill("53000");

  await page
    .getByRole("button", { name: "Tilbakestill refusjonsbeløp" })
    .click();
  await expect(refusjonsBlock.getByText("50 000 kr")).toBeVisible();

  /**
   * Variabel refusjon
   */
  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", {
      name: "Ja, men kun deler av perioden eller varierende beløp",
    })
    .click();

  const variabelRefusjonBlock = page.getByTestId("varierende-refusjon");

  await expect(
    variabelRefusjonBlock.getByLabel("Fra og med").nth(0),
  ).toHaveValue("31.05.2024");
  await expect(
    variabelRefusjonBlock.getByLabel("Fra og med").nth(0),
  ).toBeEditable({ editable: false });
  await expect(
    await finnInputFraLabel({
      page: variabelRefusjonBlock,
      nth: 0,

      labelText: "Refusjonsbeløp per måned",
    }),
  ).toHaveValue(brukNoBreakSpaces("50 000"));
  await variabelRefusjonBlock
    .getByText("Refusjonsbeløp per måned")
    .nth(0)
    .fill("-1");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page: variabelRefusjonBlock,
    nth: 0,
    label: "Refusjonsbeløp per måned",
    error: "Beløpet må være 0 eller høyere",
  });
  await variabelRefusjonBlock
    .getByText("Refusjonsbeløp per måned")
    .nth(0)
    .fill("60000");

  await variabelRefusjonBlock
    .getByText("Refusjonsbeløp per måned")
    .nth(0)
    .fill("40000");

  await expectError({
    page: variabelRefusjonBlock,
    nth: 1,
    label: "Fra og med",
    error: "Må oppgis",
  });
  await variabelRefusjonBlock.getByText("Fra og med").nth(1).fill("31.05.2024");
  await expectError({
    page: variabelRefusjonBlock,
    nth: 1,
    label: "Fra og med",
    error: "Kan ikke være før startdato",
  });

  await variabelRefusjonBlock.getByText("Fra og med").nth(1).fill("30.06.2024");

  await variabelRefusjonBlock
    .getByRole("button", { name: "Legg til ny periode" })
    .click();
  await expect(variabelRefusjonBlock.getByText("Fra og med")).toHaveCount(3);
  await variabelRefusjonBlock
    .getByRole("button", { name: "Fjern refusjonsendring" })
    .click();
  await expect(variabelRefusjonBlock.getByText("Fra og med")).toHaveCount(2);
  await expect(
    variabelRefusjonBlock.getByRole("button", {
      name: "Fjern refusjonsendring",
    }),
  ).toHaveCount(0);

  await page
    .getByRole("group", {
      name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
    })
    .getByRole("radio", { name: "Ja" })
    .click();

  const naturalytelserBlokk = page.getByTestId("naturalytelser-blokk");
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expectError({
    page: naturalytelserBlokk,
    label: "Naturalytelse som faller bort",
    error: "Må oppgis",
  });
  await expectError({
    page: naturalytelserBlokk,
    label: "Fra og med",
    error: "Må oppgis",
  });
  await expectError({
    page: naturalytelserBlokk,
    label: "Verdi pr. måned",
    error: "Beløpet må være 1 eller høyere",
  });
  await expectError({
    page: naturalytelserBlokk,
    label: "Vil naturalytelsen komme tilbake i løpet av fraværet?",
    error: "Du må svare på dette spørsmålet",
  });

  await naturalytelserBlokk
    .getByLabel("Naturalytelse som faller bort")
    .selectOption("Bil");
  await naturalytelserBlokk.getByText("Fra og med").fill("20.05.2024");
  await expectError({
    page: naturalytelserBlokk,
    label: "Fra og med",
    error: "Må være etter første uttaksdag",
  });
  await naturalytelserBlokk.getByText("Fra og med").fill("31.05.2024");
  await naturalytelserBlokk.getByText("Verdi pr. måned").fill("2500");
  await naturalytelserBlokk
    .getByRole("group", {
      name: "Vil naturalytelsen komme tilbake i løpet av fraværet?",
    })
    .getByRole("radio", { name: "Ja" })
    .click();
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page: naturalytelserBlokk,
    label: "Til og med",
    error: "Må oppgis",
  });
  await naturalytelserBlokk.getByText("Til og med").fill("10.05.2024");
  await expectError({
    page: naturalytelserBlokk,
    label: "Til og med",
    error: "Kan ikke være før fra dato",
  });
  await naturalytelserBlokk.getByText("Til og med").fill("20.07.2024");

  await page.getByRole("button", { name: "Legg til naturalytelse" }).click();
  await expect(
    naturalytelserBlokk.getByText("Naturalytelse som faller bort"),
  ).toHaveCount(2);

  await naturalytelserBlokk
    .getByLabel("Naturalytelse som faller bort")
    .nth(1)
    .selectOption("Bil");
  await naturalytelserBlokk.getByText("Fra og med").nth(1).fill("10.07.2024");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expect(
    naturalytelserBlokk.getByText(
      "Naturalytelse Bil har overlappende perioder",
    ),
  ).toBeVisible();
  await naturalytelserBlokk.getByText("Til og med").fill("05.07.2024");
  await page.getByRole("button", { name: "Neste steg" }).click(); // Ville ideelt sett ikke måtte manuelt trigge validering
  await expect(
    naturalytelserBlokk.getByText(
      "Naturalytelse Bil har overlappende perioder",
    ),
  ).toBeVisible({ visible: false });
  await naturalytelserBlokk
    .getByRole("group", {
      name: "Vil naturalytelsen komme tilbake i løpet av fraværet?",
    })
    .getByRole("radio", { name: "Nei" })
    .first()
    .click();
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expect(
    naturalytelserBlokk.getByText(
      "Naturalytelse Bil har overlappende perioder",
    ),
  ).toBeVisible();
  await naturalytelserBlokk
    .getByLabel("Naturalytelse som faller bort")
    .nth(1)
    .selectOption("Losji");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expect(
    naturalytelserBlokk.getByText(
      "Naturalytelse Bil har overlappende perioder",
    ),
  ).toBeVisible({ visible: false });

  await naturalytelserBlokk
    .getByRole("button", { name: "Slett naturalytelse" })
    .click();
  await expect(
    naturalytelserBlokk.getByText("Naturalytelse som faller bort"),
  ).toHaveCount(1);
  await expect(
    naturalytelserBlokk.getByRole("button", { name: "Slett naturalytelse" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expect(
    page.getByRole("heading", { name: "Oppsummering" }),
  ).toBeVisible();
});

test("tilbakestilling av inntekt skal også oppdatere ønsket refusjonsbeløp", async ({
  page,
}) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  // Skal forsøke hente eksisterende inntektsmelding og navigere til første steg når IM ikke finnes.
  await page.goto("/k9-im-dialog/1");

  await page.getByLabel("Navn").fill("Berømt Flyttelass");
  await page.getByLabel("Telefon").fill("12312312");
  await page.getByText("Bekreft og gå videre").click();

  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await page.getByLabel("Endret månedsinntekt").fill("40000");

  const gjennomsnittInntektBlokk = page.getByTestId(
    "gjennomsnittinntekt-block",
  );

  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
    .click();

  const refusjonsBlock = page
    .getByText("Refusjonsbeløp per måned")
    .locator("..");

  await expect(refusjonsBlock.getByText("40 000 kr")).toBeVisible();

  // Tilbakestill månedsinntekt
  await page
    .getByRole("button", { name: "Tilbakestill månedsinntekt" })
    .click();

  // Månedsinntekt skal være tilbakestilt, og refusjonsbeløp skal være oppdatert til å matche månedsinntekten.
  await expect(gjennomsnittInntektBlokk.getByText("53 000")).toBeVisible();
  await expect(refusjonsBlock.getByText("53 000 kr")).toBeVisible();
});

test("Lim inn inntekt skal også formattere input", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await page.getByRole("button", { name: "Neste steg" }).click();

  // copy text to clipboard
  await page.evaluate(() => navigator.clipboard.writeText("30 000,0123456"));
  await page.getByLabel("Endret månedsinntekt").press("ControlOrMeta+v");
  await expect(page.getByLabel("30000,01", { exact: true })).toBeVisible();
});

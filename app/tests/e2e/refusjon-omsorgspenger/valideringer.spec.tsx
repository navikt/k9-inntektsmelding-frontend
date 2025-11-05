import { expect, test } from "@playwright/test";
import {
  mockArbeidstakerOppslag,
  mockInnloggetBruker,
  mockInntektsmeldingForÅr,
  mockInntektsopplysninger,
  mockInntektsopplysningerIngenPenger,
} from "tests/mocks/refusjon-omsorgspenger/utils";
import { mockGrunnbeløp } from "tests/mocks/shared/utils";

import { formatDatoKort } from "~/utils";

const VALID_FNR = "16878397960";
const ORGANISASJONSNUMMER = "123456789";

test.describe("Refusjon Omsorgspenger - Valideringer", () => {
  test.beforeEach(async ({ page }) => {
    await mockInnloggetBruker({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });
  });

  test("Steg 1: Validering av harUtbetaltLønn og årForRefusjon", async ({
    page,
  }) => {
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Try to submit without selecting anything
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for harUtbetaltLønn
    await expect(
      page.getByText("Du må svare på om dere har utbetalt lønn under fraværet"),
    ).toBeVisible();

    // Select harUtbetaltLønn but not årForRefusjon
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for årForRefusjon
    await expect(
      page.getByText("Du må svare på hvilket år du søker refusjon for"),
    ).toBeVisible();

    // Fix the error by selecting year - error should disappear and we can proceed
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();

    // Error should be gone
    await expect(
      page.getByText("Du må svare på hvilket år du søker refusjon for"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/2-ansatt-og-arbeidsgiver`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 2: Validering av kontaktperson, fødselsnummer og organisasjonsnummer", async ({
    page,
  }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Clear the pre-filled navn field and try to submit
    await page.getByLabel("Navn").clear();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for kontaktperson navn
    await expect(
      page.getByText("Du må oppgi navn på kontaktperson"),
    ).toBeVisible();

    // Fill navn but clear telefonnummer
    await page.getByLabel("Navn").fill("Test Navn");
    await page.getByLabel("Telefonnummer").clear();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for telefonnummer (empty)
    await expect(
      page.getByText("Du må oppgi et telefonnummer for kontaktpersonen"),
    ).toBeVisible();

    // Fill invalid telefonnummer
    await page.getByLabel("Telefonnummer").fill("123");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for invalid telefonnummer format
    await expect(
      page.getByText(
        "Telefonnummer må være 8 siffer, eller 10 siffer med landkode",
      ),
    ).toBeVisible();

    // Fill valid telefonnummer but not fødselsnummer
    await page.getByLabel("Telefonnummer").fill("12345678");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for fødselsnummer (empty)
    await expect(
      page.getByText(
        "Du må oppgi fødselsnummer eller d-nummer for den ansatte",
      ),
    ).toBeVisible();

    // Fill invalid fødselsnummer
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill("12345");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for invalid fødselsnummer
    await expect(
      page.getByText("Fødselsnummer eller d-nummer er ikke gyldig"),
    ).toBeVisible();

    // Fix the error by filling valid fødselsnummer - error should disappear and we can proceed
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    await page.waitForLoadState("networkidle");

    // Error should be gone
    await expect(
      page.getByText("Fødselsnummer eller d-nummer er ikke gyldig"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/3-omsorgsdager`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av omsorgsdager", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Try to submit step 3 without filling anything
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for harDekket10FørsteOmsorgsdager
    await expect(
      page.getByText(
        "Du må svare på om dere har dekket 10 første omsorgsdager",
      ),
    ).toBeVisible();

    // Select harDekket10FørsteOmsorgsdager but not add any fravær
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing fravær
    await expect(
      page.getByText(
        "Du må oppgi fravær enten som hele dager, deler av dager eller dager som skal trekkes",
      ),
    ).toBeVisible();

    // Fix the error by adding fravær - error should disappear and we can proceed
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    await page.waitForTimeout(500);
    const fomDate = `15.06.${currentYear}`;
    const tomDate = `20.06.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fomDate);
    await page.getByLabel("Til og med").first().fill(tomDate);

    // Error should be gone
    await expect(
      page.getByText(
        "Du må oppgi fravær enten som hele dager, deler av dager eller dager som skal trekkes",
      ),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av fravær hele dager", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - select harDekket10FørsteOmsorgsdager and add fravær hele dager
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    // Wait for the new form fields to be ready
    await page.waitForTimeout(500);

    // Focus and blur a date field to mark it as touched
    await page.getByLabel("Fra og med").first().focus();
    await page.getByLabel("Fra og med").first().blur();

    // Try to submit without filling dates
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing fom
    await expect(page.getByText("Du må oppgi en fra og med dato")).toBeVisible({
      timeout: 10_000,
    });

    // Fill fom but not tom
    const fomDate = `15.01.${currentYear}`;
    await page.getByLabel("Fra og med").fill(fomDate);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing tom
    await expect(
      page.getByText("Du må oppgi en til og med dato"),
    ).toBeVisible();

    // Fill invalid date (outside year)
    const invalidDate = `15.01.${currentYear + 1}`;
    await page.getByLabel("Til og med").fill(invalidDate);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for date outside year
    await expect(
      page.getByText(
        `Fraværet må være mellom ${currentYear}.01.01 og ${formatDatoKort(new Date())}`,
      ),
    ).toBeVisible();

    // Fix the error by filling valid dates - errors should disappear and we can proceed
    const validTomDate = `20.01.${currentYear}`;
    await page.getByLabel("Til og med").fill(validTomDate);

    // Error should be gone
    await expect(
      page.getByText(
        `Fraværet må være mellom ${currentYear}.01.01 og ${formatDatoKort(new Date())}`,
      ),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av fravær deler av dagen", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - select harDekket10FørsteOmsorgsdager and add fravær deler av dagen
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("button", { name: "Legg til dag" }).click();
    // Wait for the new form fields to be ready
    await page.waitForTimeout(500);

    // Focus and blur the date field to mark it as touched
    await page.getByRole("textbox", { name: "Dato" }).first().focus();
    await page.getByRole("textbox", { name: "Dato" }).first().blur();

    // Try to submit without filling dato
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing dato
    await expect(page.getByText("Du må oppgi en dato")).toBeVisible({
      timeout: 10_000,
    });

    // Fill dato but not timer
    const dato = `15.01.${currentYear}`;
    await page.getByRole("textbox", { name: "Dato" }).first().fill(dato);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing timer
    await expect(page.getByText("Du må oppgi antall timer")).toBeVisible({
      timeout: 10_000,
    });

    // Fill invalid timer (more than 2 decimals)
    await page.getByLabel("Timer fravær").fill("3.123");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for too many decimals
    await expect(
      page.getByText("Timer kan ikke ha mer enn 2 desimaler"),
    ).toBeVisible();

    // Fill invalid timer (negative number)
    await page.getByLabel("Timer fravær").fill("-1");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for negative timer
    await expect(
      page.getByText("Antall timer må være 0 eller høyere"),
    ).toBeVisible();

    // Fill invalid timer (more than 24)
    await page.getByLabel("Timer fravær").fill("25");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for timer > 24
    await expect(
      page.getByText("Antall timer kan ikke være mer enn 24"),
    ).toBeVisible();

    // Fix the error by filling valid timer - error should disappear and we can proceed
    await page.getByLabel("Timer fravær").fill("3.5");

    // Error should be gone
    await expect(
      page.getByText("Antall timer kan ikke være mer enn 24"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av dager som skal trekkes", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - select harDekket10FørsteOmsorgsdager and add dager som skal trekkes
    await page.getByRole("radio", { name: "Ja" }).click();
    // Find the "Legg til periode" button for "dager som skal trekkes" section
    const leggTilPerioderButtons = page.getByRole("button", {
      name: "Legg til periode",
    });
    await leggTilPerioderButtons.nth(1).click();
    // Wait for the new form fields to be ready
    await page.waitForTimeout(500);

    // Focus and blur a date field to mark it as touched
    // Get the "Fra og med" field from the dager som skal trekkes section (second date range picker)
    const fraOgMedLabel = page.getByLabel("Fra og med");
    await fraOgMedLabel.focus();
    await fraOgMedLabel.blur();

    // Try to submit without filling dates
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing fom
    await expect(page.getByText("Du må oppgi en fra og med dato")).toBeVisible({
      timeout: 10_000,
    });

    // Fill dates with tom before fom - find the labels in the dager som skal trekkes section
    const fomDate = `20.01.${currentYear}`;
    const tomDate = `15.01.${currentYear}`;
    await fraOgMedLabel.fill(fomDate);
    // Get the "Til og med" field from the dager som skal trekkes section (second date range picker)
    const tilOgMedLabel = page.getByLabel("Til og med");
    await tilOgMedLabel.fill(tomDate);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // TODO: Denne bør egentlig si at tom er før fom. Men daterange-komponenten gjør det litt vrient
    await expect(page.getByText("Du må oppgi en til og med dato")).toBeVisible({
      timeout: 10_000,
    });

    // Fill dates with tom after fom (fix the error)
    const fomDate2 = `20.01.${currentYear}`;
    const tomDate2 = `25.01.${currentYear}`;
    await fraOgMedLabel.fill(fomDate2);
    await tilOgMedLabel.fill(tomDate2);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Error should be gone
    await expect(
      page.getByText("Du må oppgi en til og med dato"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av overlappende perioder", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - add fravær hele dager
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    const fom1 = `15.01.${currentYear}`;
    const tom1 = `20.01.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fom1);
    await page.getByLabel("Til og med").first().fill(tom1);

    // Add dager som skal trekkes that overlaps with fravær hele dager
    const leggTilPerioderButtons = page.getByRole("button", {
      name: "Legg til periode",
    });
    await leggTilPerioderButtons.nth(1).click();
    const fom2 = `18.01.${currentYear}`;
    const tom2 = `22.01.${currentYear}`;
    await page.getByLabel("Fra og med").last().fill(fom2);
    await page.getByLabel("Til og med").last().fill(tom2);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for overlapping periods
    await expect(
      page.getByText("Dagene kan ikke overlappe med fravær hele dager"),
    ).toBeVisible({ timeout: 10_000 });

    // Fix the error by adjusting dates to not overlap - error should disappear and we can proceed
    const fom2Fixed = `25.01.${currentYear}`;
    const tom2Fixed = `28.01.${currentYear}`;
    await page.getByLabel("Fra og med").last().fill(fom2Fixed);
    await page.getByLabel("Til og med").last().fill(tom2Fixed);

    // Error should be gone
    await expect(
      page.getByText("Dagene kan ikke overlappe med fravær hele dager"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av fravær innenfor de 10 første dagene", async ({
    page,
  }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - say yes to dekket 10 første dager, but add fravær within first 10 days
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    const fom = `05.01.${currentYear}`;
    const tom = `08.01.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fom);
    await page.getByLabel("Til og med").first().fill(tom);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for fravær within first 10 days when claiming to have covered them
    await expect(
      page.getByText(
        "Du oppgir å ha dekket 10 omsorgsdager i år, samtidig som du ber om refusjon for fravær innenfor de 10 første dagene av året",
      ),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByLabel("Fra og med").first().fill(`20.01.${currentYear}`);
    await page.getByLabel("Til og med").first().fill(`25.01.${currentYear}`);

    // Error should be gone
    await expect(
      page.getByText(
        "Du oppgir å ha dekket 10 omsorgsdager i år, samtidig som du ber om refusjon for fravær innenfor de 10 første dagene av året",
      ),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 4: Validering av inntekt", async ({ page }) => {
    await mockArbeidstakerOppslag({ page });
    await mockInntektsopplysningerIngenPenger({
      page,
    });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - add fravær
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    const fom = `15.06.${currentYear}`;
    const tom = `20.06.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fom);
    await page.getByLabel("Til og med").first().fill(tom);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 4 to load
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });

    // Try to submit step 4 without inntekt (set to 0)
    // First, we need to check if there's an error alert for inntekt
    // The validation should show an error if inntekt is 0 or missing
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for inntekt being 0
    await expect(
      page.getByText(
        "Månedsinntekten er satt til kr 0. Dersom dere har utbetalt lønn og krever refusjon må månedsinntekten være større en kr 0.",
      ),
    ).toBeVisible();
  });

  test("Steg 3: Validering av overlapp mellom fravær deler av dag og fravær hele dager", async ({
    page,
  }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 3 to load (with longer timeout)
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    // Fill step 3 - add fravær hele dager
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    const fom1 = `15.06.${currentYear}`;
    const tom1 = `20.06.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fom1);
    await page.getByLabel("Til og med").first().fill(tom1);

    // Add fravær deler av dag that overlaps with fravær hele dager
    await page.getByRole("button", { name: "Legg til dag" }).click();
    const overlapDate = `18.06.${currentYear}`;
    await page.getByRole("textbox", { name: "Dato" }).first().fill(overlapDate);
    await page.getByLabel("Timer fravær").fill("3.5");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for overlapping periods
    await expect(
      page.getByText(
        "Fravær deler av dag må ikke overlappe med fravær hele dager",
      ),
    ).toBeVisible();

    // Fix the error by changing the date to not overlap - error should disappear and we can proceed
    const nonOverlapDate = `25.06.${currentYear}`;
    await page
      .getByRole("textbox", { name: "Dato" })
      .first()
      .fill(nonOverlapDate);

    // Error should be gone
    await expect(
      page.getByText(
        "Fravær deler av dag må ikke overlappe med fravær hele dager",
      ),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 3: Validering av overlapp mellom dager som skal trekkes og fravær deler av dag", async ({
    page,
  }) => {
    await mockArbeidstakerOppslag({ page });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Additional wait for form to update
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for navigation to complete - check URL first
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/3-omsorgsdager`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible();

    // Fill step 3 - add fravær deler av dag
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("button", { name: "Legg til dag" }).click();
    const delerAvDagDate = `15.06.${currentYear}`;
    await page
      .getByRole("textbox", { name: "Dato" })
      .first()
      .fill(delerAvDagDate);
    await page.getByLabel("Timer fravær").fill("3.5");

    // Add dager som skal trekkes that overlaps with fravær deler av dag
    const leggTilPerioderButtons = page.getByRole("button", {
      name: "Legg til periode",
    });
    await leggTilPerioderButtons.nth(1).click();
    const fom = `15.06.${currentYear}`;
    const tom = `20.06.${currentYear}`;
    await page.getByLabel("Fra og med").fill(fom);
    await page.getByLabel("Til og med").fill(tom);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for overlapping periods
    await expect(
      page.getByText("Dagene kan ikke overlappe med fravær deler av dag"),
    ).toBeVisible();

    // Fix the error by adjusting dates to not overlap - error should disappear and we can proceed
    const fomFixed = `25.06.${currentYear}`;
    const tomFixed = `28.06.${currentYear}`;
    await page.getByLabel("Fra og med").fill(fomFixed);
    await page.getByLabel("Til og med").fill(tomFixed);

    // Error should be gone
    await expect(
      page.getByText("Dagene kan ikke overlappe med fravær deler av dag"),
    ).not.toBeVisible({ timeout: 5000 });

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/4-refusjon`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Steg 4: Validering av korrigert inntekt og endringsårsaker", async ({
    page,
  }) => {
    await mockArbeidstakerOppslag({ page });
    await mockInntektsopplysningerIngenPenger({
      page,
    });
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    // Fill step 1
    await page.getByRole("radio", { name: "Ja" }).click();
    const currentYear = new Date().getFullYear();
    await page.getByRole("radio", { name: String(currentYear) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 2 to load
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    // Fill step 2
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    // Wait for network to be idle after API call
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Additional wait for form to update
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for navigation to complete - check URL first
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/3-omsorgsdager`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible();

    // Fill step 3 - add fravær
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    const fom = `15.06.${currentYear}`;
    const tom = `20.06.${currentYear}`;
    await page.getByLabel("Fra og med").first().fill(fom);
    await page.getByLabel("Til og med").first().fill(tom);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Wait for step 4 to load
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });

    // Wait for inntektsopplysninger to load
    await page.waitForTimeout(2000);

    // Click "Endre månedslønn"
    await page.getByRole("button", { name: "Endre månedslønn" }).click();

    // Set korrigert inntekt to 0
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for korrigert inntekt being 0
    await expect(
      page.getByText(
        "Månedsinntekten er satt til kr 0. Dersom dere har utbetalt lønn og krever refusjon må månedsinntekten være større en kr 0.",
      ),
    ).toBeVisible();

    await page.getByLabel("Endret månedsinntekt").fill("45000");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing endringsårsak
    await expect(page.getByText("Du må oppgi en endringsårsak")).toBeVisible();

    // Select endringsårsak but not fill required dates
    await page
      .getByLabel("Hva er årsaken til endringen?")
      .selectOption("Ferie");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing fom
    await expect(page.getByText("Du må oppgi fra og med dato")).toBeVisible();

    // Fill fom but not tom (when required)
    const fomDate = `01.05.${currentYear}`;
    await page.getByLabel("Fra og med").fill(fomDate);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for missing tom
    await expect(page.getByText("Du må oppgi til og med dato")).toBeVisible();

    // Fill tom before fom
    const tomDate = `01.04.${currentYear}`;
    await page.getByLabel("Til og med").fill(tomDate);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Should show error for tom before fom
    await expect(
      page.getByText("Fra og med dato må være før til og med dato"),
    ).toBeVisible();

    // Fix the error by correcting the dates - error should disappear and we can proceed
    const fomDateFixed = `01.05.${currentYear}`;
    const tomDateFixed = `15.05.${currentYear}`;
    await page.getByLabel("Fra og med").fill(fomDateFixed);
    await page.getByLabel("Til og med").fill(tomDateFixed);

    // Verify we can proceed to the next step
    await page.getByRole("button", { name: "Neste steg" }).click();
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/5-oppsummering`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

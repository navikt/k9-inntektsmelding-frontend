import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  mockAGIOpplysningerUregistrert,
  mockGrunnbeløp,
  mockHentPersonUregistrert,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

const settUppOgGåTilDineOpplysninger = async (
  page: import("@playwright/test").Page,
) => {
  await mockHentPersonUregistrert({ page });
  await mockGrunnbeløp({ page });
  await mockAGIOpplysningerUregistrert({
    page,
    json: agiOpplysningerResponseUregistrert,
  });

  await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
  await page
    .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
    .click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.04.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await expect(
    page.getByRole("heading", { name: "Dine opplysninger" }),
  ).toBeVisible();
};

test.describe("AGI unntatt Aa-registeret – valideringer", () => {
  test("Inngang: validerer fødselsnummer og første fraværsdag", async ({
    page,
  }) => {
    await mockHentPersonUregistrert({ page });
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();

    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expect(page.getByText("Må oppgis").first()).toBeVisible();

    await page.getByLabel("Ansattes fødselsnummer").fill("123");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expect(
      page.getByText("Du må fylle ut et gyldig fødselsnummer"),
    ).toBeVisible();

    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expect(
      page.getByText("Du må fylle ut et gyldig fødselsnummer"),
    ).toBeHidden();
  });

  test("Steg 1 Dine opplysninger: navn og telefon kreves", async ({ page }) => {
    await settUppOgGåTilDineOpplysninger(page);

    await page.getByLabel("Navn").clear();
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(page.getByText("Navn er påkrevd")).toBeVisible();

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").clear();
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(page.getByText("Telefonnummer er påkrevd")).toBeVisible();

    await page.getByLabel("Telefon").fill("123");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(
      page.getByText("Telefonnummer må være 8 siffer eller ha landskode"),
    ).toBeVisible();

    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(
      page.getByRole("heading", { name: /Inntekt og refusjon/i }),
    ).toBeVisible();
  });

  test("Steg 2 Inntekt og refusjon: krever valg av refusjon og naturalytelser", async ({
    page,
  }) => {
    await settUppOgGåTilDineOpplysninger(page);

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(
      page.getByRole("heading", { name: /Inntekt og refusjon/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Forventer at vi blir værende på steget pga. valideringsfeil
    await expect(
      page.getByRole("heading", { name: /Inntekt og refusjon/i }),
    ).toBeVisible();
  });
});

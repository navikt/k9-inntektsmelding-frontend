import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { agiUregistrertSendInntektsmeldingResponse } from "tests/mocks/arbeidsgiverinitiert/uregistrert/agi-send-inntektsmelding";
import {
  mockAGIOpplysningerUregistrert,
  mockAGISendInntektsmeldingUregistrert,
  mockGrunnbeløp,
  mockHentPersonUregistrert,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("AGI unntatt Aa-registeret – happy path", () => {
  test("Fullstendig flyt med refusjon", async ({ page }) => {
    await mockHentPersonUregistrert({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();

    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    // Steg 1 – Dine opplysninger
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Steg 2 – Inntekt og refusjon
    await page
      .getByRole("radiogroup", {
        name: "Betaler dere lønn under fraværet og krever refusjon?",
      })
      .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
      .click();

    await page
      .getByRole("radiogroup", {
        name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
      })
      .getByRole("radio", { name: "Nei" })
      .click();

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Steg 3 – Oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    await mockAGISendInntektsmeldingUregistrert({
      page,
      json: agiUregistrertSendInntektsmeldingResponse,
    });

    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen", { exact: false }),
    ).toBeVisible();
  });

  test("Flyt uten refusjon", async ({ page }) => {
    await mockHentPersonUregistrert({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();

    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await page
      .getByRole("radiogroup", {
        name: "Betaler dere lønn under fraværet og krever refusjon?",
      })
      .getByRole("radio", { name: "Nei" })
      .click();

    await page
      .getByRole("radiogroup", {
        name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
      })
      .getByRole("radio", { name: "Nei" })
      .click();

    await page.getByRole("button", { name: "Neste steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    await mockAGISendInntektsmeldingUregistrert({
      page,
      json: {
        ...agiUregistrertSendInntektsmeldingResponse,
        refusjon: [],
      },
    });

    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen", { exact: false }),
    ).toBeVisible();
  });

  test("Navigering tilbake mellom stegene fungerer", async ({ page }) => {
    await mockHentPersonUregistrert({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();

    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await expect(
      page.getByRole("heading", { name: /Inntekt og refusjon/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Forrige steg" }).click();
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });
});

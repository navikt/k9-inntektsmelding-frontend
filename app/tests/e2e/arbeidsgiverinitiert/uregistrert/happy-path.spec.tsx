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
    const opplysningerRequest = page.waitForRequest(
      (request) =>
        request.url().endsWith("/opplysninger/uregistrert-v2") &&
        request.method() === "POST",
    );
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    const opplysningerRespons = await opplysningerRequest;
    expect(opplysningerRespons.postDataJSON()).toMatchObject({
      fødselsnummer: FAKE_FNR,
      ytelseType: "PLEIEPENGER_SYKT_BARN",
    });

    // Steg 1 – Dine opplysninger
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
    await expect(page.getByText("F.nr. 098101 98874")).toBeVisible();
    await expect(page.getByText(/Momentan Trakt/i)).toHaveCount(0);
    await expect(page.getByText(/undefined/)).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
    await expect(page.getByText("F.nr. 098101 98874")).toBeVisible();
    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Steg 2 – Inntekt og refusjon
    await expect(
      page.getByText("Den ansattes lønn før 01.04.2024", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Den ansattes første dag med pleiepenger sykt barn", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText(/undefined/)).toHaveCount(0);
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
    await expect(page.getByText("F.nr. 098101 98874")).toBeVisible();
    await expect(page.getByText(/Momentan Trakt/i)).toHaveCount(0);

    await mockAGISendInntektsmeldingUregistrert({
      page,
      json: agiUregistrertSendInntektsmeldingResponse,
    });

    const innsending = page.waitForRequest(
      (request) =>
        request
          .url()
          .endsWith("/send-inntektsmelding/arbeidsgiverinitiert-uregistrert") &&
        request.method() === "POST",
    );
    await page.getByRole("button", { name: "Send inn" }).click();
    const innsendingsRequest = await innsending;
    expect(innsendingsRequest.postDataJSON()).toMatchObject({
      aktorId: agiOpplysningerResponseUregistrert.person.aktørId,
    });

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Inntektsmelding for den ansatte med fødselsnummer 098101 98874 er sendt",
      }),
    ).toBeVisible();
    await expect(page.getByText(/Momentan Trakt/i)).toHaveCount(0);
    await expect(page.getByText(/undefined/)).toHaveCount(0);
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

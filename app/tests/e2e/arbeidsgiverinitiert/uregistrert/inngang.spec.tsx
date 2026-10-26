import { expect, test } from "@playwright/test";
import { velgFraCombobox } from "tests/e2e/utils";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { arbeidsforholdUregistrertResponse } from "tests/mocks/arbeidsgiverinitiert/uregistrert/arbeidsforhold";
import {
  mockAGIOpplysningerUregistrert,
  mockHentPersonUregistrert,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("Inngang", () => {
  test("viser ikke navn ved valg mellom flere arbeidsgivere", async ({
    page,
  }) => {
    await mockHentPersonUregistrert({
      page,
      json: {
        ...arbeidsforholdUregistrertResponse,
        arbeidsforhold: [
          ...arbeidsforholdUregistrertResponse.arbeidsforhold,
          {
            organisasjonsnavn: "Nav",
            organisasjonsnummer: "974652293",
          },
        ],
      },
    });
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
      page.getByRole("button", { name: "Opprett inntektsmelding" }),
    ).toBeVisible();
    await expect(page.getByText(/Momentan Trakt/i)).toHaveCount(0);
    await velgFraCombobox({
      page,
      testId: "steg-0-combobox-arbeidsgiver",
      søketekst: "974652293",
      alternativNavn: /974652293/,
    });
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
    await expect(page.getByText(/Momentan Trakt/i)).toHaveCount(0);
  });

  test("should be able to navigate to the inngang page", async ({ page }) => {
    await mockHentPersonUregistrert({ page });
    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });
});

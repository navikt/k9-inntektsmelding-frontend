import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  mockAGIOpplysningerUregistrert,
  mockHentPersonUregistrert,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("Inngang", () => {
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

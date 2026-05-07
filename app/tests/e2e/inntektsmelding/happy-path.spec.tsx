import { expect, test } from "@playwright/test";
import { enkelSendInntektsmeldingResponse } from "tests/mocks/inntektsmelding/send-inntektsmelding";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test.describe("Happy path", () => {
  test("Enklest mulige utfylling", async ({ page }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });

    await page.goto("/k9-im-dialog/1/dine-opplysninger");

    // Vi starter på "dine-opplysninger" steget
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();

    // Fyll ut navn og telefonnummer på "dine-opplysninger steget"
    await page.getByLabel("Navn").fill("Test Brukersen");
    await page.getByLabel("Telefon").fill("13371337");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Nå er vi på "inntekt og refusjon" steget
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

    // Nå er vi på "oppsummering"-steget.
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
    // TODO: Legg til noen assertions på at valgene man tar er med i oppsummeringen?

    await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
      await route.fulfill({ json: enkelSendInntektsmeldingResponse });
    });
    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen"),
    ).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";
import { sjekkUniversellUtforming } from "tests/e2e/uu";
import { enkelSendInntektsmeldingResponse } from "tests/mocks/inntektsmelding/send-inntektsmelding";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test.describe("Happy path", () => {
  test("Enklest mulige utfylling", { tag: "@uu" }, async ({ page }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });

    await page.goto("/k9-im-dialog/1/dine-opplysninger");

    // Vi starter på "dine-opplysninger" steget
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
    await sjekkUniversellUtforming(page, "Dine opplysninger");

    // Fyll ut navn og telefonnummer på "dine-opplysninger steget"
    await page.getByLabel("Navn").fill("Test Brukersen");
    await page.getByLabel("Telefon").fill("13371337");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
    await expect(
      page.getByRole("heading", { name: "Inntekt og refusjon", exact: true }),
    ).toBeVisible();
    await sjekkUniversellUtforming(page, "Inntekt og refusjon");

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
    await sjekkUniversellUtforming(page, "Utfylt inntekt og refusjon");

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Nå er vi på "oppsummering"-steget.
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
    await sjekkUniversellUtforming(page, "Oppsummering");
    // TODO: Legg til noen assertions på at valgene man tar er med i oppsummeringen?

    await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
      await route.fulfill({ json: enkelSendInntektsmeldingResponse });
    });
    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen"),
    ).toBeVisible();
    await sjekkUniversellUtforming(page, "Kvittering");
  });

  test(
    "Valideringsfeil og endring av inntekt",
    { tag: "@uu" },
    async ({ page }) => {
      await mockOpplysninger({ page });
      await mockGrunnbeløp({ page });
      await mockInntektsmeldinger({ page });
      await page.goto("/k9-im-dialog/1/dine-opplysninger");

      await page.getByLabel("Navn", { exact: true }).clear();
      await page.getByLabel("Telefon", { exact: true }).clear();
      await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
      await expect(
        page.getByText("Navn er påkrevd", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Telefonnummer er påkrevd", { exact: true }),
      ).toBeVisible();
      await sjekkUniversellUtforming(
        page,
        "Kontaktopplysninger med valideringsfeil",
      );

      await page.getByLabel("Navn", { exact: true }).fill("Test Brukersen");
      await page.getByLabel("Telefon", { exact: true }).fill("13371337");
      await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
      await page
        .getByRole("button", { name: "Endre månedslønn", exact: true })
        .click();
      const endretMånedsinntekt = page.getByRole("textbox", {
        name: "Endret månedsinntekt",
        exact: true,
      });
      await expect(endretMånedsinntekt).toHaveValue("");
      await endretMånedsinntekt.fill("42000");
      await expect(endretMånedsinntekt).toHaveAccessibleName(
        "Endret månedsinntekt",
      );
      await expect(endretMånedsinntekt).toHaveValue(/^42\s000$/);
      await sjekkUniversellUtforming(page, "Endret månedsinntekt");

      await page.getByRole("button", { name: "Neste steg" }).click();
      await expect(
        page.getByRole("heading", { name: "Inntekt og refusjon", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("combobox", { name: "Hva er årsaken til endringen?" }),
      ).toHaveAttribute("aria-invalid", "true");
      await endretMånedsinntekt.fill("-1");
      await page.getByRole("button", { name: "Neste steg" }).click();
      await expect(endretMånedsinntekt).toHaveAttribute("aria-invalid", "true");
      await expect(endretMånedsinntekt).toHaveAccessibleName(
        "Endret månedsinntekt",
      );
      await sjekkUniversellUtforming(
        page,
        "Inntekt og refusjon med valideringsfeil",
      );
    },
  );
});

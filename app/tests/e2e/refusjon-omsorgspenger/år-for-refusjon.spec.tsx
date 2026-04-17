import { expect, test } from "@playwright/test";
import {
  mockInnloggetBruker,
  mockInntektsmeldingForÅr,
  mockInntektsopplysninger,
} from "tests/mocks/refusjon-omsorgspenger/utils";
import { mockGrunnbeløp } from "tests/mocks/shared/utils";

const ORGANISASJONSNUMMER = "123456789";

test.describe("ÅrForRefusjon", () => {
  test("viser årsvalg med både fjoråret og inneværende år før 1. april, og kan gå videre til steg 2 etter å ha valgt år", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2024-03-15") });
    await mockInnloggetBruker({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });

    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    await expect(page.getByRole("radio", { name: "2023" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "2024" })).toBeVisible();

    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("radio", { name: "2023" }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/2-ansatt-og-arbeidsgiver`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();
  });

  test("skjuler årsvalg etter 1. april og setter inneværende år automatisk, og kan gå videre til steg 2", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2024-04-02") });
    await mockInnloggetBruker({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });

    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();

    await expect(page.getByRole("radio", { name: "2023" })).not.toBeVisible();
    await expect(page.getByRole("radio", { name: "2024" })).not.toBeVisible();

    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/2-ansatt-og-arbeidsgiver`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();
  });
});

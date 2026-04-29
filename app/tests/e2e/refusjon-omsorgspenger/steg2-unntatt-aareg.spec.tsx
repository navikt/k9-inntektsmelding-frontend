import { expect, type Page, test } from "@playwright/test";
import {
  mockInnloggetBruker,
  mockInntektsmeldingForÅr,
  mockInntektsopplysninger,
} from "tests/mocks/refusjon-omsorgspenger/utils";
import { mockGrunnbeløp } from "tests/mocks/shared/utils";

const VALID_FNR = "16878397960";
const ORGANISASJONSNUMMER = "123456789";
const DAGENS_DATO = new Date("2026-03-15").getTime();
const FJORÅRET = 2025;

const mockArbeidstakerOppslagFantIngen = (page: Page) =>
  page.route(
    "**/*/server/api/refusjon-omsorgsdager/arbeidstaker",
    async (route) => {
      await route.fulfill({
        status: 404,
        json: { feilkode: "fant ingen personer" },
      });
    },
  );

const mockArbeidsgiversOrganisasjoner = (page: Page) =>
  page.route(
    "**/*/arbeidsgiverinitiert/arbeidsgiver/organisasjoner",
    async (route) => {
      await route.fulfill({
        json: {
          organisasjoner: [
            {
              organisasjonsnavn: "TEST ORGANISASJON AS",
              organisasjonsnummer: ORGANISASJONSNUMMER,
            },
          ],
        },
      });
    },
  );

test.describe("Refusjon Omsorgspenger – steg 2 unntatt Aa-registeret", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: DAGENS_DATO });
    await mockInnloggetBruker({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });
    await mockArbeidstakerOppslagFantIngen(page);
    await mockArbeidsgiversOrganisasjoner(page);
  });

  test("Viser informasjonsboks når person ikke har registrerte arbeidsforhold, og kan bekrefte unntatt-løype", async ({
    page,
  }) => {
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("radio", { name: String(FJORÅRET) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();

    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    await page.waitForLoadState("networkidle");

    // Informasjonsboks vises
    await expect(
      page.getByText(
        "Vi fant ingen registrerte arbeidsforhold i dine virksomheter",
        { exact: false },
      ),
    ).toBeVisible({ timeout: 10_000 });

    // Bekreft unntatt aaregisteret
    await page
      .getByRole("checkbox", {
        name: "Arbeidstakeren er unntatt Aa-registeret",
      })
      .check();

    // Da skal arbeidsgiver-seksjonen vise virksomheten fra innlogget bruker
    await expect(page.getByText("TEST ORGANISASJON AS")).toBeVisible();
    await expect(page.getByText(ORGANISASJONSNUMMER).last()).toBeVisible();

    // Vi kan gå videre
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

  test("Endring av fødselsnummer nullstiller unntatt-valg", async ({
    page,
  }) => {
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("radio", { name: String(FJORÅRET) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    await page.waitForLoadState("networkidle");

    await page
      .getByRole("checkbox", {
        name: "Arbeidstakeren er unntatt Aa-registeret",
      })
      .check();
    await expect(page.getByText("TEST ORGANISASJON AS")).toBeVisible();

    // Endre fnr → unntatt skal nullstilles og virksomhet skal ikke lenger vises
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill("");
    await page
      .getByLabel("Ansattes fødselsnummer (11 siffer)")
      .fill("01010199999");
    await expect(page.getByText("TEST ORGANISASJON AS")).toBeHidden();
  });
});

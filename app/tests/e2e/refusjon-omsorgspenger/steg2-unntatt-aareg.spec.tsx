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
    const forespørsler: string[] = [];
    page.on("request", (forespørsel) => {
      forespørsler.push(forespørsel.url());
    });
    await page.route("**/imdialog/inntektsmeldinger-for-aar/v2", (route) =>
      route.fulfill({
        status: 400,
        contentType: "text/plain",
        body: "Fant ikke person for oppgitt fødselsnummer",
      }),
    );
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
    await expect(page.getByText("Navn", { exact: true })).toHaveCount(1);
    await expect(
      page.getByText("Fant ikke person", { exact: true }),
    ).toBeHidden();

    // Vi kan gå videre
    const historikkforespørsel = page.waitForRequest(
      "**/imdialog/inntektsmeldinger-for-aar/v2",
    );
    await page.getByRole("button", { name: "Neste steg" }).click();
    const historikk = await historikkforespørsel;
    expect(historikk.method()).toBe("POST");
    expect(historikk.postDataJSON()).toEqual({
      fødselsnummer: VALID_FNR,
      arbeidsgiverIdent: ORGANISASJONSNUMMER,
      år: FJORÅRET,
    });
    await page.waitForURL(
      `**/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/3-omsorgsdager`,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText("Kunne ikke hente tidligere innsendinger."),
    ).toBeVisible();
    await mockInntektsmeldingForÅr({ page, json: [] });
    await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
    await expect(
      page.getByText("Kunne ikke hente tidligere innsendinger."),
    ).toBeHidden();
    await page.getByRole("radio", { name: "Ja", exact: true }).check();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    await page.getByLabel("Fra og med").first().fill(`15.06.${FJORÅRET}`);
    await page.getByLabel("Til og med").first().fill(`20.06.${FJORÅRET}`);
    await page.getByRole("button", { name: "Neste steg" }).click();
    await expect(
      page.getByText(`Lønn før 15.06.${FJORÅRET}`, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Neste steg" }).click();
    await expect(
      page.getByRole("heading", { name: "Oppsummering", exact: true }),
    ).toBeVisible();
    let innsendinger = 0;
    await page.route(
      "**/imdialog/send-inntektsmelding/omsorgspenger-refusjon/v2",
      async (route) => {
        innsendinger += 1;
        if (innsendinger === 1) {
          await route.fulfill({
            status: 400,
            contentType: "text/plain",
            body: "Fant ikke person for oppgitt fødselsnummer",
          });
          return;
        }
        const { fødselsnummer, ...forespørsel } = route
          .request()
          .postDataJSON();
        expect(fødselsnummer).toBe(VALID_FNR);
        expect(forespørsel).not.toHaveProperty("aktorId");
        expect(forespørsel).not.toHaveProperty("ytelse");
        await route.fulfill({
          json: {
            ...forespørsel,
            aktorId: "1234567890123",
            ytelse: "OMSORGSPENGER",
            id: 5_000_801,
            foresporselUuid: "abc-123",
            opprettetTidspunkt: "2026-03-15T10:00:00.000",
          },
        });
      },
    );
    await page.getByRole("button", { name: "Send inn", exact: true }).click();
    await expect(
      page.getByText("Noe gikk galt. Vennligst prøv igjen senere."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Oppsummering", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Send inn", exact: true }).click();
    await expect(
      page.getByText("Vi har mottatt refusjonskravet"),
    ).toBeVisible();
    expect(
      forespørsler.some(
        (url) =>
          url.endsWith("/arbeidsgiverinitiert/arbeidstaker") ||
          url.endsWith("/arbeidsgivere/uregistrert"),
      ),
    ).toBe(false);
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

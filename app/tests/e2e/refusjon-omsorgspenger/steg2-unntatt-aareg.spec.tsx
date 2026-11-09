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
const ANSATT = {
  fornavn: "Test",
  mellomnavn: "Mellom",
  etternavn: "Ansatt",
  aktørId: "1234567890123",
  kjønn: "UKJENT",
};

const tidligereInnsending = {
  aktorId: ANSATT.aktørId,
  ytelse: "OMSORGSPENGER",
  arbeidsgiverIdent: ORGANISASJONSNUMMER,
  kontaktperson: { navn: "Test Bruker", telefonnummer: "12345678" },
  refusjon: [{ fom: `${FJORÅRET}-05-01`, beløp: 50_000 }],
  startdato: `${FJORÅRET}-05-01`,
  inntekt: 50_000,
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  omsorgspenger: {
    fraværHeleDager: [{ fom: `${FJORÅRET}-05-01`, tom: `${FJORÅRET}-05-02` }],
    fraværDelerAvDagen: [],
    harUtbetaltPliktigeDager: true,
  },
  id: 123,
  opprettetTidspunkt: "2025-05-03T10:00:00.000",
  foresporselUuid: "tidligere-innsending",
};

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
    await page.route("**/arbeidsgiverinitiert/arbeidstaker", (route) =>
      route.fulfill({ json: ANSATT }),
    );
  });

  test("Viser informasjonsboks når person ikke har registrerte arbeidsforhold, og kan bekrefte unntatt-løype", async ({
    page,
  }) => {
    const opplysningsoppslag: string[] = [];
    page.on("request", (forespørsel) => {
      if (
        forespørsel
          .url()
          .endsWith("/arbeidsgiverinitiert/opplysninger/uregistrert")
      ) {
        opplysningsoppslag.push(forespørsel.url());
      }
    });
    await mockInntektsmeldingForÅr({ page, json: [tidligereInnsending] });
    let antallOppslag = 0;
    await page.route("**/arbeidsgiverinitiert/arbeidstaker", async (route) => {
      antallOppslag += 1;
      await route.fulfill(
        antallOppslag === 1 ? { status: 500, json: {} } : { json: ANSATT },
      );
    });
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

    await expect(page.getByRole("alert")).toContainText(
      "Kunne ikke hente opplysninger om den ansatte",
    );
    await expect(
      page.getByRole("button", { name: "Neste steg" }),
    ).toBeDisabled();
    const ansattRequest = page.waitForRequest(
      "**/arbeidsgiverinitiert/arbeidstaker",
    );
    await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
    const ansattoppslag = await ansattRequest;
    expect(ansattoppslag.postDataJSON()).toEqual({ fødselsnummer: VALID_FNR });
    await expect(
      page.getByRole("button", { name: "Neste steg" }),
    ).toBeEnabled();
    await expect(
      page.getByText("Test Mellom Ansatt", { exact: true }),
    ).toBeVisible();

    const inntektsmeldingerRequest = page.waitForRequest(
      "**/imdialog/inntektsmeldinger-for-aar",
    );

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
    const historikkoppslag = await inntektsmeldingerRequest;
    expect(historikkoppslag.postDataJSON()).toEqual({
      aktørId: ANSATT.aktørId,
      arbeidsgiverIdent: ORGANISASJONSNUMMER,
      år: FJORÅRET,
    });
    await expect(
      page.getByText(`Tidligere innsendinger for ${FJORÅRET}`),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible();
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    await page.getByLabel("Fra og med").first().fill(`15.06.${FJORÅRET}`);
    await page.getByLabel("Til og med").first().fill(`20.06.${FJORÅRET}`);
    await page.getByRole("button", { name: "Neste steg" }).click();
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Neste steg" }).click();
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    await page.route(
      "**/imdialog/send-inntektsmelding/omsorgspenger-refusjon",
      async (route) => {
        const request = route.request().postDataJSON();
        await route.fulfill({
          json: {
            ...request,
            id: 5_000_801,
            foresporselUuid: "abc-123",
            opprettetTidspunkt: "2026-03-15T10:00:00.000",
          },
        });
      },
    );
    const sendRequest = page.waitForRequest(
      "**/imdialog/send-inntektsmelding/omsorgspenger-refusjon",
    );
    await page.getByRole("button", { name: "Send inn" }).click();
    const innsending = await sendRequest;
    expect(innsending.postDataJSON()).toMatchObject({
      aktorId: ANSATT.aktørId,
      arbeidsgiverIdent: ORGANISASJONSNUMMER,
      startdato: `${FJORÅRET}-06-15`,
    });
    await expect(
      page.getByText("Vi har mottatt refusjonskravet"),
    ).toBeVisible();
    expect(opplysningsoppslag).toEqual([]);
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

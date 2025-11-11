import { expect, test } from "@playwright/test";
import {
  mockAGIOpplysninger,
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

import { agiOpplysningerResponseNyAnsatt } from "../../mocks/arbeidsgiverinitiert/agi-opplysninger";

const FAKE_FNR = "09810198874";

test.describe("AGI Første fraværsdag validering", () => {
  test.beforeEach(async ({ page }) => {
    await mockGrunnbeløp({ page });
  });

  test("Skal validere første fraværsdag før navigering til oppsummering", async ({
    page,
  }) => {
    // Mock successful person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "JA" på refusjon
    await page
      .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
      .click();

    // Mock successful validation for the date
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || "{}");

        // Sjekk at riktig data sendes
        expect(postData.fødselsnummer).toBe(FAKE_FNR);
        expect(postData.ytelseType).toBe("PLEIEPENGER_SYKT_BARN");
        expect(postData.førsteFraværsdag).toBe("2024-04-01");

        await route.fulfill({
          json: {
            fornavn: "MOMENTAN",
            etternavn: "TRAKT",
            arbeidsforhold: [
              {
                organisasjonsnavn: "NAV",
                organisasjonsnummer: "974652293",
              },
            ],
            kjønn: "MANN",
          },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Vi skal nå være på oppsummering-steget (validering var vellykket)
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
  });

  test("Skal vise feilmelding når person ikke finnes", async ({ page }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await page
      .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
      .click();

    // Mock failed validation - person not found
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        await route.fulfill({
          status: 404,
          json: { type: "FANT_IKKE_PERSON" },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal vise feilmelding
    await expect(
      page.getByText(
        "Vi finner ingen ansatt registrert hos dere med dette fødselsnummeret",
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Sjekk om fødselsnummeret er riktig og at den ansatte er registrert hos dere i Aa-registeret",
      ),
    ).toBeVisible();

    // Skal fortsatt være på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Skal vise feilmelding når dato er ugyldig", async ({ page }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await page
      .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
      .click();

    // Mock failed validation - invalid date
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        await route.fulfill({
          status: 403,
          json: { type: "INGEN_SAK_FUNNET" },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal vise feilmelding for ugyldig dato
    await expect(
      page.getByText(
        "Du kan ikke sende inn inntektsmelding for pleiepenger sykt barn med denne datoen som første fraværsdag med refusjon.",
      ),
    ).toBeVisible();

    // Skal fortsatt være på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Skal ikke validere når 'NEI' er valgt på refusjon", async ({
    page,
  }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "NEI" på refusjon
    await page.getByRole("radio", { name: "Nei" }).click();

    // Knappen skal være disabled når NEI er valgt
    const nesteStegButton = page.getByRole("button", { name: "Neste steg" });
    await expect(nesteStegButton).toBeDisabled();

    // Ingen validering skal skje siden knappen er disabled
  });

  test("Skal vise feilmelding når første fraværsdag endres fremover i tid", async ({
    page,
  }) => {
    const uuid = "f29dcea7-febe-4a76-911c-ad8f6d3e8858";

    // Mock opplysninger for eksisterende inntektsmelding
    const opplysningerMedUuid = {
      ...agiOpplysningerResponseNyAnsatt,
      forespørselUuid: uuid,
    };
    await mockOpplysninger({
      page,
      json: opplysningerMedUuid,
      uuid,
    });

    // Mock eksisterende inntektsmelding med første fraværsdag 01.04.2024
    const eksisterendeInntektsmelding = [
      {
        id: 1_001_706,
        foresporselUuid: uuid,
        aktorId: "1234567890123",
        ytelse: "PLEIEPENGER_SYKT_BARN" as const,
        arbeidsgiverIdent: "974652293",
        kontaktperson: {
          navn: "Berømt Flyttelass",
          telefonnummer: "12312312",
        },
        startdato: "2024-04-01",
        inntekt: 45_000,
        opprettetTidspunkt: "2024-04-01T10:00:00.000",
        refusjon: [
          {
            fom: "2024-04-01",
            beløp: 45_000,
          },
        ],
        bortfaltNaturalytelsePerioder: [],
        endringAvInntektÅrsaker: [],
      },
    ];

    await mockInntektsmeldinger({
      page,
      json: eksisterendeInntektsmelding,
      uuid,
    });

    // Gå til refusjon-steget for eksisterende inntektsmelding
    await page.goto(`/k9-im-dialog/agi/${uuid}/refusjon`);

    // Vi er nå på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "JA" på refusjon
    await page
      .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
      .click();

    // Prøv å endre første fraværsdag til en senere dato (02.04.2024)
    const førsteFraværsdagField = page.getByLabel(
      "Første fraværsdag med refusjon",
    );
    await førsteFraværsdagField.clear();
    await førsteFraværsdagField.fill("02.04.2024");
    // Trigger blur to ensure validation runs
    await førsteFraværsdagField.blur();

    // Skal vise feilmelding om at datoen ikke kan endres fremover i tid
    await expect(
      page.getByText("Du kan ikke endre denne datoen fremover i tid."),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Skal du endre datoen dere ønsker refusjon fra fremover i tid, må du legge inn endringen under punktet «Ja, men kun deler av perioden eller varierende beløp».",
      ),
    ).toBeVisible();

    // Mock successful validation for the date (selv om vi ikke skal kunne gå videre)
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        await route.fulfill({
          json: {
            fornavn: "MOMENTAN",
            etternavn: "TRAKT",
            arbeidsforhold: [
              {
                organisasjonsnavn: "NAV",
                organisasjonsnummer: "974652293",
              },
            ],
            kjønn: "MANN",
          },
        });
      },
    );

    // Prøv å klikke "Neste steg" - dette skal ikke fungere pga validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal fortsatt være på refusjon-steget (validering forhindrer navigering)
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Skal også vise feilmelding i feltet (validering forhindrer form submission)
    // Verifiser at feilmeldingen fortsatt er synlig
    await expect(
      page.getByText("Du kan ikke endre denne datoen fremover i tid."),
    ).toHaveCount(2);

    // Nå skal vi teste at brukeren kan utbedre feilen ved å endre datoen tilbake
    // Endre tilbake til original dato (01.04.2024) eller en tidligere dato
    await førsteFraværsdagField.clear();
    await førsteFraværsdagField.fill("01.04.2024");
    await førsteFraværsdagField.blur();

    // Feilmeldingen skal nå være borte
    await expect(
      page.getByText("Du kan ikke endre denne datoen fremover i tid."),
    ).not.toBeVisible();

    // Mock successful validation for the date
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || "{}");

        // Sjekk at riktig data sendes
        expect(postData.fødselsnummer).toBe(FAKE_FNR);
        expect(postData.ytelseType).toBe("PLEIEPENGER_SYKT_BARN");
        expect(postData.førsteFraværsdag).toBe("2024-04-01");

        await route.fulfill({
          json: {
            fornavn: "MOMENTAN",
            etternavn: "TRAKT",
            arbeidsforhold: [
              {
                organisasjonsnavn: "NAV",
                organisasjonsnummer: "974652293",
              },
            ],
            kjønn: "MANN",
          },
        });
      },
    );

    // Nå skal det være mulig å gå videre
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Vi skal nå være på oppsummering-steget (validering var vellykket)
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
  });
});

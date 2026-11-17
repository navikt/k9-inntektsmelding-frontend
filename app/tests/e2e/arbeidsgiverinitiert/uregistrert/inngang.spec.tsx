import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  mockAGIOpplysningerUregistrert,
  mockArbeidsgiversOrganisasjoner,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("Inngang", () => {
  test("should be able to navigate to the inngang page", async ({ page }) => {
    await mockArbeidsgiversOrganisasjoner({ page });
    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    const organisasjonsforespørsel = page.waitForRequest(
      "**/arbeidsgiverinitiert/arbeidsgiver/organisasjoner",
    );
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await expect(page.getByText("Navn", { exact: true })).toBeHidden();
    const opplysningsforespørsel = page.waitForRequest(
      "**/arbeidsgiverinitiert/opplysninger/uregistrert",
    );
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    const organisasjonskall = await organisasjonsforespørsel;
    const opplysningskall = await opplysningsforespørsel;
    expect(organisasjonskall.method()).toBe("GET");
    expect(opplysningskall.postDataJSON()).toEqual({
      fødselsnummer: FAKE_FNR,
      førsteFraværsdag: "2024-04-01",
      ytelseType: "PLEIEPENGER_SYKT_BARN",
      organisasjonsnummer: "315786940",
    });

    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });

  test("Krever virksomhetsvalg og støtter valg med tastatur", async ({
    page,
  }) => {
    await mockArbeidsgiversOrganisasjoner({
      page,
      json: {
        organisasjoner: [
          {
            organisasjonsnavn: "Første virksomhet",
            organisasjonsnummer: "315786940",
          },
          {
            organisasjonsnavn: "Andre virksomhet",
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
      .check();
    const virksomhetsvalg = page.getByRole("combobox", {
      name: "Arbeidsgiver",
      exact: true,
    });
    await expect(virksomhetsvalg).toBeVisible();
    await expect(page.getByLabel("Ansattes fødselsnummer")).toBeEmpty();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
    await expect(page.getByText("Du må velge arbeidsgiver")).toBeVisible();
    await virksomhetsvalg.fill("Andre virksomhet");
    await virksomhetsvalg.press("ArrowDown");
    await virksomhetsvalg.press("Enter");
    const opplysningsforespørsel = page.waitForRequest(
      "**/opplysninger/uregistrert",
    );
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
    const opplysningskall = await opplysningsforespørsel;
    expect(opplysningskall.postDataJSON()).toMatchObject({
      organisasjonsnummer: "974652293",
    });
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });

  test("Viser beskjed ved endring under henting av opplysninger og lar brukeren prøve igjen", async ({
    page,
  }) => {
    await mockArbeidsgiversOrganisasjoner({ page });
    await mockAGIOpplysningerUregistrert({
      page,
      json: {
        ...agiOpplysningerResponseUregistrert,
        person: {
          ...agiOpplysningerResponseUregistrert.person,
          fødselsnummer: "16878397960",
        },
      },
    });
    let skalEndreFødselsnummer = true;
    await page.route("**/opplysninger/uregistrert", async (route) => {
      if (skalEndreFødselsnummer) {
        skalEndreFødselsnummer = false;
        await page.getByLabel("Ansattes fødselsnummer").fill("16878397960");
      }
      await route.fulfill({
        json: {
          ...agiOpplysningerResponseUregistrert,
          person: {
            ...agiOpplysningerResponseUregistrert.person,
            fødselsnummer: route.request().postDataJSON().fødselsnummer,
          },
        },
      });
    });
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .check();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Opplysningene ble endret under henting." }),
    ).toBeVisible();
    await expect(page.getByLabel("Ansattes fødselsnummer")).toHaveValue(
      "16878397960",
    );
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeHidden();
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem("agi-unntatt-aaregister"),
      ),
    ).toBeNull();
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });
  for (const [type, feilmelding] of [
    [
      "FINNES_IKKE_I_AAREG",
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    ],
    [
      "INGEN_INNTEKT",
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    ],
    ["A_INNTEKT_NEDE", "Vi kan ikke hente inntekt fra A-inntekt nå"],
    ["FINNES_I_AAREG", "allerede er registrert i Aa-registeret"],
    [
      "INGEN_SAK_FUNNET",
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    ],
    [
      "SENDT_FOR_TIDLIG",
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    ],
    [
      "PERSON_IKKE_FUNNET",
      "Kunne ikke hente opplysninger. Sjekk at opplysningene er riktige, og prøv igjen.",
    ],
    ["MANGLER_TILGANG_FEIL", "Du har ikke tilgang til den valgte virksomheten"],
  ]) {
    test(`Viser ${type} fra opplysningshentingen og nullstiller ved endring`, async ({
      page,
    }) => {
      await mockArbeidsgiversOrganisasjoner({ page });
      await page.route("**/opplysninger/uregistrert", (route) =>
        route.fulfill({
          status: type === "A_INNTEKT_NEDE" ? 500 : 403,
          json: { type },
        }),
      );
      await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
      await page
        .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
        .check();
      await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
      await page.getByLabel("Første fraværsdag").fill("01.04.2024");
      await page.getByRole("button", { name: "Hent opplysninger" }).click();
      await expect(page.getByText(feilmelding, { exact: false })).toBeVisible();
      await expect(
        page.getByText(feilmelding, { exact: false }),
      ).not.toContainText("første fraværsdag");
      await expect(
        page.getByRole("heading", { name: "Dine opplysninger" }),
      ).toBeHidden();
      await page.getByLabel("Første fraværsdag").fill("02.04.2024");
      await expect(page.getByText(feilmelding, { exact: false })).toBeHidden();
    });
  }

  for (const [tilfelle, status, json, feilmelding] of [
    [
      "ingen virksomheter",
      200,
      { organisasjoner: [] },
      "Vi finner ingen virksomheter du har tilgang til",
    ],
    ["serverfeil", 500, {}, "Kunne ikke hente virksomhetene dine"],
    [
      "ugyldig respons",
      200,
      { arbeidsforhold: [] },
      "Kunne ikke hente virksomhetene dine",
    ],
  ] as const) {
    test(`Stopper ved ${tilfelle}`, async ({ page }) => {
      await page.route("**/arbeidsgiver/organisasjoner", (route) =>
        route.fulfill({ status, json }),
      );
      await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
      await page
        .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
        .check();
      await expect(page.getByText(feilmelding, { exact: false })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Hent opplysninger" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("heading", { name: "Dine opplysninger" }),
      ).toBeHidden();
    });
  }

  test("Kan prøve organisasjonshenting på nytt uten personopplysninger", async ({
    page,
  }) => {
    let antallKall = 0;
    await page.route("**/arbeidsgiver/organisasjoner", (route) => {
      antallKall += 1;
      return route.fulfill(
        antallKall === 1
          ? { status: 500, json: {} }
          : {
              json: {
                organisasjoner: [
                  {
                    organisasjonsnavn: "Virksomhet",
                    organisasjonsnummer: "315786940",
                  },
                  {
                    organisasjonsnavn: "Annen virksomhet",
                    organisasjonsnummer: "974652293",
                  },
                ],
              },
            },
      );
    });
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .check();
    await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "Arbeidsgiver", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Ansattes fødselsnummer")).toBeEmpty();
    expect(antallKall).toBe(2);
  });
});

import { expect, test } from "@playwright/test";
import {
  finnWcagAvvik,
  sjekkIngenVannrettRulling,
  sjekkUniversellUtforming,
} from "tests/e2e/uu";
import { utgåttOpplysningerResponse } from "tests/mocks/inntektsmelding/opplysninger";
import {
  mockArbeidstakerOppslag,
  mockInnloggetBruker,
  mockInntektsmeldingForÅr,
  mockInntektsopplysninger,
} from "tests/mocks/refusjon-omsorgspenger/utils";
import {
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test.describe("UU-regresjoner", { tag: "@uu" }, () => {
  test("Åpne kontroller og serverfeil har tilgjengelig innhold og kontrast", async ({
    page,
  }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });
    await page.goto("/k9-im-dialog/1/dine-opplysninger");

    await expect(page.getByText("Steg 1 av 3", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Vis alle steg" }).click();
    await expect(
      page.getByRole("button", { name: "Skjul alle steg" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Vis alle steg" }),
    ).not.toBeVisible();
    await sjekkUniversellUtforming(page, "Åpen stegoversikt");
    await sjekkIngenVannrettRulling(page, "Åpen stegoversikt");
    await page.getByRole("button", { name: "Skjul alle steg" }).click();

    await page.getByLabel("Navn", { exact: true }).fill("Test Brukersen");
    await page.getByLabel("Telefon", { exact: true }).fill("13371337");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
    await expect(page.getByText("Steg 2 av 3", { exact: true })).toBeVisible();
    await page
      .getByRole("radio", {
        name: "Ja, men kun deler av perioden eller varierende beløp",
      })
      .check();
    await page
      .getByRole("group", { name: "Refusjonsperiode 2", exact: true })
      .getByRole("button", { name: "Åpne datovelger" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await sjekkUniversellUtforming(page, "Åpen datovelger");
    await sjekkIngenVannrettRulling(page, "Åpen datovelger");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await page
      .getByRole("radiogroup", {
        name: "Betaler dere lønn under fraværet og krever refusjon?",
      })
      .getByRole("radio", { name: "Nei", exact: true })
      .check();
    await page
      .getByRole("radiogroup", {
        name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
      })
      .getByRole("radio", { name: "Nei", exact: true })
      .check();
    await page.getByRole("button", { name: "Neste steg" }).click();
    await expect(
      page.getByRole("heading", { name: "Oppsummering", exact: true }),
    ).toBeVisible();
    const endringslenke = page.getByRole("link", {
      name: "Endre inntekt",
      exact: true,
    });
    await endringslenke.hover();
    await sjekkUniversellUtforming(page, "Endringslenke ved hover");
    await page.mouse.move(0, 0);
    await endringslenke.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(endringslenke).toBeFocused();
    expect(
      await endringslenke.evaluate((element) =>
        element.matches(":focus-visible"),
      ),
    ).toBe(true);
    await sjekkUniversellUtforming(page, "Endringslenke ved tastaturfokus");
    await page.route("**/*/imdialog/send-inntektsmelding", (rute) =>
      rute.fulfill({ status: 500, json: { message: "Testfeil" } }),
    );
    await page.getByRole("button", { name: "Send inn", exact: true }).click();
    await expect(
      page.getByText("Noe gikk galt.", { exact: true }),
    ).toBeVisible();
    await sjekkUniversellUtforming(page, "Serverfeil ved innsending");
    await sjekkIngenVannrettRulling(page, "Serverfeil ved innsending");
  });

  test("Feilsider har beskrivende tittel, én hovedoverskrift og riktig språk", async ({
    page,
  }) => {
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });
    await mockOpplysninger({ page, json: utgåttOpplysningerResponse });
    await page.goto("/k9-im-dialog/1");
    await expect(
      page.getByRole("heading", { name: "Oppgaven er utgått" }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Oppgaven er utgått");
    await sjekkUniversellUtforming(page, "Utgått oppgave");

    await page.route("**/*/imdialog/opplysninger?foresporselUuid=2", (rute) =>
      rute.fulfill({ status: 500, json: { message: "Testfeil" } }),
    );
    await page.goto("/k9-im-dialog/2");
    await expect(
      page.getByRole("heading", { name: "Beklager, noe gikk galt." }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Beklager, noe gikk galt");
    await sjekkUniversellUtforming(page, "Generell feilside");
    expect(
      await page
        .getByRole("heading", { name: "Something went wrong" })
        .evaluate((element) => element.closest("[lang]")?.getAttribute("lang")),
    ).toBe("en");

    await mockOpplysninger({ page, uuid: "3" });
    await mockInntektsmeldinger({ page, uuid: "3" });
    await page.goto("/k9-im-dialog/3/finnes-ikke");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Inntektsmelding pleiepenger sykt barn",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Beklager, vi fant ikke siden",
      }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Beklager, vi fant ikke siden");
    await sjekkUniversellUtforming(page, "Fant ikke siden i skjemaet");

    await page.goto("/k9-im-dialog/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Beklager, vi fant ikke siden",
      }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Beklager, vi fant ikke siden");
    await sjekkUniversellUtforming(page, "Fant ikke siden");
  });

  test("Kalenderen kan brukes med tastatur og lukkes med Escape", async ({
    page,
  }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });
    await page.goto("/k9-im-dialog/1/dine-opplysninger");
    await page.getByLabel("Navn", { exact: true }).fill("Test Brukersen");
    await page.getByLabel("Telefon", { exact: true }).fill("13371337");
    await page
      .getByRole("button", { name: "Bekreft og gå videre" })
      .press("Enter");
    await expect(page.getByText("Steg 2 av 3", { exact: true })).toBeVisible();
    await page
      .getByRole("radio", {
        name: "Ja, men kun deler av perioden eller varierende beløp",
      })
      .check();

    const periode = page.getByRole("group", {
      name: "Refusjonsperiode 2",
      exact: true,
    });
    const åpneKalender = periode.getByRole("button", {
      name: "Åpne datovelger",
    });
    await periode.getByLabel("Fra og med").fill("16.07.2024");
    await periode.getByLabel("Fra og med").focus();
    await page.keyboard.press("Tab");
    await expect(åpneKalender).toBeFocused();

    await page.keyboard.press("Enter");
    const kalender = page.getByRole("dialog");
    await expect(kalender).toBeVisible();
    await expect
      .poll(() =>
        kalender.evaluate((dialog) => dialog.contains(document.activeElement)),
      )
      .toBe(true);
    const valgtDag = kalender.getByRole("button", { name: "tirsdag 16" });
    const tabTilValgtDag = async () => {
      for (let forsøk = 0; forsøk < 5; forsøk++) {
        await page.keyboard.press("Tab");
        await expect(kalender.locator(":focus")).toHaveCount(1);
        if (await valgtDag.evaluate((dag) => dag === document.activeElement)) {
          return;
        }
      }
    };
    await tabTilValgtDag();
    await expect(valgtDag).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(kalender).toBeHidden();
    await expect(åpneKalender).toBeFocused();

    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        kalender.evaluate((dialog) => dialog.contains(document.activeElement)),
      )
      .toBe(true);
    await tabTilValgtDag();
    await page.keyboard.press("ArrowRight");
    await expect(
      kalender.getByRole("button", { name: "onsdag 17" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(kalender).toBeHidden();
    await expect(periode.getByLabel("Fra og med")).toHaveValue("17.07.2024");
    await expect(åpneKalender).toBeFocused();
  });

  test("Virksomhetslisten kan åpnes og brukes med tastatur", async ({
    page,
  }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
      .check();
    await page.getByLabel("Ansattes fødselsnummer").fill("09810198874");
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    const virksomhet = page.getByRole("combobox", { name: "Arbeidsgiver" });
    await virksomhet.focus();
    await expect(page.getByRole("listbox")).toBeHidden();

    await page.keyboard.press("ArrowDown");
    const valg = page.getByRole("listbox").getByRole("option");
    await expect(valg.first()).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(virksomhet).toBeFocused();
    await expect(
      page.getByRole("listitem").filter({ hasText: /\(\d{9}\)/ }),
    ).toBeVisible();
  });

  test("Innholdet virker i både stående og liggende retning", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const vindu = globalThis as typeof globalThis & {
        retningslåser: unknown[];
      };
      vindu.retningslåser = [];
      if (screen.orientation) {
        screen.orientation.lock = async (retning) => {
          vindu.retningslåser.push(retning);
        };
      }
    });
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({ page });
    await mockHentPersonOgArbeidsforhold({ page });
    await mockInnloggetBruker({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });

    const sjekkBeggeRetninger = async (side: string) => {
      const tekster: string[] = [];
      for (const [bredde, høyde] of [
        [360, 640],
        [640, 360],
      ]) {
        await page.setViewportSize({ width: bredde, height: høyde });
        await expect(page.getByRole("main")).toBeVisible();
        await sjekkIngenVannrettRulling(page, `${side} ${bredde}×${høyde}`);
        const [tekst] = await page.getByRole("main").allInnerTexts();
        tekster.push(tekst.replaceAll(/\s+/g, " ").trim());
      }
      expect(tekster[1], `Samme innhold i begge retninger: ${side}`).toBe(
        tekster[0],
      );
      expect(
        await page.evaluate(() => {
          const regler = [...document.styleSheets].flatMap((ark) => {
            try {
              return [...ark.cssRules];
            } catch {
              return [];
            }
          });
          return regler
            .filter(
              (regel) =>
                regel instanceof CSSMediaRule &&
                regel.conditionText.includes("orientation"),
            )
            .map((regel) => (regel as CSSMediaRule).conditionText);
        }),
        `Retningsavhengig CSS: ${side}`,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () =>
            (globalThis as typeof globalThis & { retningslåser: unknown[] })
              .retningslåser,
        ),
        `Låsing av retning: ${side}`,
      ).toEqual([]);
    };

    await page.goto("/k9-im-dialog/1/dine-opplysninger");
    await expect(page.getByText("Steg 1 av 3", { exact: true })).toBeVisible();
    await sjekkBeggeRetninger("Dine opplysninger");
    await page.getByLabel("Navn", { exact: true }).fill("Test Brukersen");
    await page.getByLabel("Telefon", { exact: true }).fill("13371337");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
    await expect(page.getByText("Steg 2 av 3", { exact: true })).toBeVisible();
    await sjekkBeggeRetninger("Inntekt og refusjon");

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();
    await sjekkBeggeRetninger("Opprett inntektsmelding");

    await page.goto("/k9-im-dialog/refusjon-omsorgspenger/123456789/1-intro");
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();
    await sjekkBeggeRetninger("Refusjon av omsorgspenger");
  });

  test(
    "Virksomhetslisten har tilgjengelig navn",
    { tag: "@kjent-avvik" },
    async ({ page }) => {
      await mockHentPersonOgArbeidsforhold({ page });
      await mockGrunnbeløp({ page });
      await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
      await page
        .getByRole("radio", { name: "Ny ansatt som mottar ytelse fra Nav" })
        .check();
      await page.getByLabel("Ansattes fødselsnummer").fill("09810198874");
      await page.getByLabel("Første fraværsdag").fill("01.04.2024");
      await page.getByRole("button", { name: "Hent opplysninger" }).click();
      await page
        .getByRole("combobox", { name: "Arbeidsgiver" })
        .fill("974652293");
      const liste = page.getByRole("listbox");
      await expect(liste.getByRole("option")).toHaveCount(1);
      await sjekkIngenVannrettRulling(page, "Åpent virksomhetsvalg");

      const avvik = await finnWcagAvvik(page, "Åpent virksomhetsvalg");
      expect(avvik.length).toBeLessThanOrEqual(1);
      for (const { id, nodes } of avvik) {
        expect(id).toBe("aria-input-field-name");
        expect(nodes).toHaveLength(1);
        expect(nodes[0].html).toContain('role="listbox"');
      }

      test.fail(true, "Åpent 4.1.2-avvik i Aksel: navnløs virksomhetsliste.");
      await expect(liste).toHaveAccessibleName(/\S/);
    },
  );

  test(
    "Datoperioder i omsorgspenger krever ikke vannrett rulling",
    {
      tag: "@kjent-avvik",
    },
    async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.clock.install({ time: new Date("2026-03-15").getTime() });
      await mockInnloggetBruker({ page });
      await mockGrunnbeløp({ page });
      await mockInntektsmeldingForÅr({ page, json: [] });
      await mockInntektsopplysninger({ page });
      await mockArbeidstakerOppslag({ page });
      await page.goto("/k9-im-dialog/refusjon-omsorgspenger/123456789/1-intro");
      await page.getByRole("radio", { name: "Ja", exact: true }).check();
      await page.getByRole("radio", { name: "2025", exact: true }).check();
      await page.getByRole("button", { name: "Neste steg" }).click();
      await page
        .getByLabel("Ansattes fødselsnummer (11 siffer)")
        .fill("16878397960");
      await page.getByRole("button", { name: "Neste steg" }).click();
      await expect(
        page.getByRole("heading", {
          name: "Omsorgsdager dere søker refusjon for",
        }),
      ).toBeVisible();
      await page.getByRole("radio", { name: "Ja", exact: true }).check();
      await page
        .getByRole("button", { name: "Legg til periode" })
        .first()
        .click();
      await expect(page.getByLabel("Fra og med").first()).toBeVisible();
      await sjekkUniversellUtforming(page, "Datoperiode i omsorgspenger");
      const overløp = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      await test.info().attach("Reflow-avvik", {
        body: JSON.stringify({ bredde: 320, overløp }),
        contentType: "application/json",
      });

      expect(test.info().errors).toHaveLength(0);
      test.fail(
        true,
        "Åpent 1.4.10-avvik: datoperioden er for bred ved 320 CSS-piksler.",
      );
      expect(overløp).toBe(0);
    },
  );
});

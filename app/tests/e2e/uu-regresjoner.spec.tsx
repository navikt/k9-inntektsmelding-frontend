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
      page.getByRole("heading", { name: "Beklager, vi fant ikke siden" }),
    ).toBeVisible();
    await expect(page).toHaveTitle("Beklager, vi fant ikke siden");
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

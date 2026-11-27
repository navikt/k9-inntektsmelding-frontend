import { chromium, expect, test } from "@playwright/test";
import {
  sjekkIngenVannrettRulling,
  sjekkUniversellUtforming,
} from "tests/e2e/uu";
import { enkelSendInntektsmeldingResponse } from "tests/mocks/inntektsmelding/send-inntektsmelding";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

test.describe("Ekte nettleserzoom", { tag: ["@uu", "@nettleserzoom"] }, () => {
  test.setTimeout(60_000);

  for (const zoom of [2, 4]) {
    test(`Full innsending ved ${zoom * 100} % zoom fra 1280 piksler`, async ({
      baseURL,
    }) => {
      const utvidelse = `${test.info().project.testDir}/fixtures/nettleserzoom`;
      const kontekst = await chromium.launchPersistentContext("", {
        baseURL,
        channel: "chromium",
        viewport: null,
        deviceScaleFactor: undefined,
        args: [
          "--window-size=1280,1080",
          `--disable-extensions-except=${utvidelse}`,
          `--load-extension=${utvidelse}`,
        ],
      });
      try {
        const page = await kontekst.newPage();
        await mockOpplysninger({ page });
        await mockGrunnbeløp({ page });
        await mockInntektsmeldinger({ page });
        await page.route("**/*/imdialog/send-inntektsmelding", (rute) =>
          rute.fulfill({ json: enkelSendInntektsmeldingResponse }),
        );
        await page.goto("/k9-im-dialog/1/dine-opplysninger");
        expect(await page.evaluate(() => innerWidth)).toBe(1280);
        const arbeider =
          kontekst.serviceWorkers()[0] ??
          (await kontekst.waitForEvent("serviceworker"));
        const settZoom = async (forstørring: number) => {
          const faktiskZoom = await arbeider.evaluate<number>(`(async () => {
          const [fane] = await chrome.tabs.query({ url: ${JSON.stringify(page.url())} });
          if (fane?.id === undefined) throw new Error("Fant ikke testfanen");
          await chrome.tabs.setZoom(fane.id, ${forstørring});
          return chrome.tabs.getZoom(fane.id);
        })()`);
          expect(faktiskZoom).toBeCloseTo(forstørring, 10);
          await page.waitForFunction(
            (verdi) =>
              innerWidth === 1280 / verdi && devicePixelRatio === verdi,
            forstørring,
          );
        };
        await settZoom(zoom);
        const cdp = await kontekst.newCDPSession(page);
        const kontrollerSteg = async (steg: string) => {
          await settZoom(1);
          const [vanligTekst] = await page.getByRole("main").allInnerTexts();
          await settZoom(zoom);
          await expect(page.getByRole("main")).toHaveText(vanligTekst, {
            useInnerText: true,
          });
          const metrikker = await cdp.send("Page.getLayoutMetrics");
          expect(metrikker.cssVisualViewport.zoom).toBeCloseTo(zoom, 10);
          expect(metrikker.layoutViewport.clientWidth).toBe(1280);
          await test.info().attach(`Zoom-${steg}`, {
            body: JSON.stringify({
              nettleser: kontekst.browser()?.version(),
              zoom: metrikker.cssVisualViewport.zoom,
              ...(await page.evaluate(() => ({
                bredde: innerWidth,
                høyde: innerHeight,
                pikselforhold: devicePixelRatio,
              }))),
            }),
            contentType: "application/json",
          });
          await sjekkIngenVannrettRulling(page, steg);
          await sjekkUniversellUtforming(page, steg);
        };

        await kontrollerSteg("Dine opplysninger");
        await page
          .getByRole("button", { name: "Vis alle steg" })
          .press("Enter");
        await expect(
          page.getByRole("button", { name: "Skjul alle steg" }),
        ).toBeVisible();
        await kontrollerSteg("Åpen stegoversikt");
        await page
          .getByRole("button", { name: "Skjul alle steg" })
          .press("Enter");
        await page.getByLabel("Navn", { exact: true }).fill("Test Brukersen");
        await page.getByLabel("Telefon", { exact: true }).fill("13371337");
        await page
          .getByRole("button", { name: "Bekreft og gå videre" })
          .press("Enter");
        await expect(
          page.getByRole("heading", {
            name: "Inntekt og refusjon",
            exact: true,
          }),
        ).toBeVisible();
        await kontrollerSteg("Inntekt og refusjon");
        await page
          .getByRole("radiogroup", {
            name: "Betaler dere lønn under fraværet og krever refusjon?",
          })
          .getByRole("radio", { name: "Nei", exact: true })
          .press("Space");
        await page
          .getByRole("radiogroup", {
            name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
          })
          .getByRole("radio", { name: "Nei", exact: true })
          .press("Space");
        await page.getByRole("button", { name: "Neste steg" }).press("Enter");
        await expect(
          page.getByRole("heading", {
            name: "Oppsummering",
            exact: true,
          }),
        ).toBeVisible();
        await kontrollerSteg("Oppsummering");
        await page
          .getByRole("button", { name: "Send inn", exact: true })
          .press("Enter");
        await expect(
          page.getByText("Vi har mottatt inntektsmeldingen"),
        ).toBeVisible();
        await kontrollerSteg("Kvittering");
        await cdp.detach();
      } finally {
        await kontekst.close();
      }
    });
  }
});

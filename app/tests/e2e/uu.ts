import AxeBuilder from "@axe-core/playwright";
import { expect, Page, test } from "@playwright/test";

export const finnWcagAvvik = async (page: Page, steg: string) => {
  const { violations, incomplete, testEngine, url, timestamp } =
    await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

  await test.info().attach(`axe-${steg}`, {
    body: JSON.stringify(
      { testEngine, url, timestamp, violations, incomplete },
      null,
      2,
    ),
    contentType: "application/json",
  });

  return violations;
};

export const sjekkIngenVannrettRulling = async (page: Page, steg: string) => {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          dokument:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
          rulleområder: [...document.querySelectorAll("main *")]
            .filter(
              (element) =>
                element.checkVisibility() &&
                element.clientWidth > 0 &&
                !["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) &&
                ["auto", "scroll"].includes(
                  getComputedStyle(element).overflowX,
                ) &&
                element.scrollWidth > element.clientWidth + 1,
            )
            .map((element) => ({
              element: element.tagName,
              navn: element.getAttribute("aria-label"),
              bredde: element.clientWidth,
              innholdsbredde: element.scrollWidth,
            })),
        })),
      { message: `Ingen vannrett rulling: ${steg}` },
    )
    .toEqual({ dokument: 0, rulleområder: [] });
};

const STANDARDTITTEL = "Inntektsmelding";
const OMSORGSPENGER = "søknad om refusjon av omsorgspenger for arbeidsgiver";

const forventedeSidetitler: { rute: RegExp; tittel: RegExp }[] = [
  { rute: /\/opprett\/?$/, tittel: /^Opprett inntektsmelding for \S/ },
  {
    rute: /\/1-intro$/,
    tittel: /^Søknad om refusjon av omsorgspenger for arbeidsgiver$/,
  },
  {
    rute: /\/2-ansatt-og-arbeidsgiver$/,
    tittel: new RegExp(`^Ansatt og arbeidsgiver – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/3-omsorgsdager$/,
    tittel: new RegExp(`^Omsorgsdager – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/4-refusjon$/,
    tittel: new RegExp(`^Refusjon – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/5-oppsummering$/,
    tittel: new RegExp(`^Oppsummering – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/6-kvittering$/,
    tittel: new RegExp(`^Kvittering – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/refusjon-omsorgspenger\/\d+\/[^/]+$/,
    tittel: new RegExp(`^Innsendt refusjonskrav – ${OMSORGSPENGER}$`),
  },
  {
    rute: /\/dine-opplysninger$/,
    tittel: /^Dine opplysninger – inntektsmelding for \S/,
  },
  {
    rute: /\/inntekt-og-refusjon$/,
    tittel: /^Inntekt og refusjon – inntektsmelding for \S/,
  },
  { rute: /\/refusjon$/, tittel: /^Refusjon – inntektsmelding for \S/ },
  { rute: /\/oppsummering$/, tittel: /^Oppsummering – inntektsmelding for \S/ },
  { rute: /\/kvittering$/, tittel: /^Kvittering – inntektsmelding for \S/ },
  { rute: /\/vis$/, tittel: /^Innsendt inntektsmelding for \S/ },
];

export const sjekkSidetittel = async (page: Page, steg: string) => {
  await expect
    .soft(page.locator("head > title"), `Én sidetittel i ${steg}`)
    .toHaveCount(1);
  const { pathname } = new URL(page.url());
  const forventet = forventedeSidetitler.find(({ rute }) =>
    rute.test(pathname),
  );
  if (forventet) {
    await expect
      .soft(page, `Sidetittel i ${steg}`)
      .toHaveTitle(forventet.tittel);
    return;
  }
  const tittel = await page.title();
  expect.soft(tittel.trim(), `Sidetittel i ${steg}`).not.toBe("");
  expect
    .soft(tittel, `Beskrivende sidetittel i ${steg}`)
    .not.toBe(STANDARDTITTEL);
};

export const sjekkUniversellUtforming = async (page: Page, steg: string) => {
  await test.step(`Axe: ${steg}`, async () => {
    await expect(page.getByRole("main")).toBeVisible();
    await sjekkSidetittel(page, steg);

    const overskrifter = await page
      .getByRole("main")
      .getByRole("heading")
      .evaluateAll((elementer) =>
        elementer.map((element) => ({
          nivå: Number(
            element.getAttribute("aria-level") ?? element.tagName.slice(1),
          ),
          tekst: element.textContent,
        })),
      );
    expect
      .soft(
        overskrifter.filter(({ nivå }) => nivå === 1),
        `Én hovedoverskrift i ${steg}`,
      )
      .toHaveLength(1);
    const hoppIOverskriftsnivå = overskrifter.filter(
      ({ nivå }, indeks) => nivå > (overskrifter[indeks - 1]?.nivå ?? 0) + 1,
    );
    expect
      .soft(hoppIOverskriftsnivå, `Overskriftshierarki i ${steg}`)
      .toEqual([]);

    const wcagAvvik = await finnWcagAvvik(page, steg);
    const avvik = wcagAvvik.map(({ id, help, nodes }) => ({
      regel: id,
      beskrivelse: help,
      elementer: nodes.map(({ target }) => target),
    }));
    expect.soft(avvik, `WCAG-avvik i ${steg}`).toEqual([]);
  });
};

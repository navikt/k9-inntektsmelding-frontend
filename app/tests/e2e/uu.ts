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

export const sjekkSpråk = async (page: Page, steg: string) => {
  await expect
    .soft(page.locator("html"), `Bokmål som sidespråk i ${steg}`)
    .toHaveAttribute("lang", /^nb(-no)?$/i);

  const { violations } = await new AxeBuilder({ page })
    .withRules([
      "html-has-lang",
      "html-lang-valid",
      "html-xml-lang-mismatch",
      "valid-lang",
    ])
    .analyze();
  expect
    .soft(
      violations.map(({ id, nodes }) => ({
        regel: id,
        elementer: nodes.map(({ target }) => target),
      })),
      `Språkmerking i ${steg}`,
    )
    .toEqual([]);
};

const TEKSTAVSTAND_CSS = `
  * {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p { margin-bottom: 2em !important; }
`;

export const sjekkTekstavstand = async (page: Page, steg: string) => {
  const stil = await page.addStyleTag({ content: TEKSTAVSTAND_CSS });
  const tap = await page.evaluate(() => {
    const elementer = [...document.querySelectorAll("main *")].filter(
      (element) =>
        element.checkVisibility() &&
        element.clientWidth > 1 &&
        element.clientHeight > 1 &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) &&
        (element.textContent ?? "").trim() !== "",
    );
    const navn = new Map(
      elementer.map((element) => [
        element,
        `${element.tagName.toLowerCase()} «${(element.textContent ?? "").trim().slice(0, 60)}»`,
      ]),
    );

    const klippet = elementer
      .filter((element) => {
        const { overflowX, overflowY } = getComputedStyle(element);
        return (
          (["hidden", "clip"].includes(overflowX) &&
            element.scrollWidth > element.clientWidth + 1) ||
          (["hidden", "clip"].includes(overflowY) &&
            element.scrollHeight > element.clientHeight + 1)
        );
      })
      .map((element) => navn.get(element));

    const linjer = elementer.flatMap((element) => {
      const forfedre: Element[] = [];
      for (
        let forelder = element.parentElement;
        forelder;
        forelder = forelder.parentElement
      ) {
        forfedre.push(forelder);
      }
      const rammer = forfedre
        .filter((forelder) => getComputedStyle(forelder).overflow !== "visible")
        .map((forelder) => forelder.getBoundingClientRect());
      const lag =
        [element, ...forfedre].find((kandidat) => {
          const { position, zIndex } = getComputedStyle(kandidat);
          return (
            kandidat.matches("dialog, [popover]") ||
            (["absolute", "fixed"].includes(position) && zIndex !== "auto")
          );
        }) ?? null;

      return [...element.childNodes]
        .filter(
          (node) =>
            node.nodeType === Node.TEXT_NODE &&
            (node.textContent ?? "").trim() !== "",
        )
        .flatMap((node) => {
          const område = document.createRange();
          område.selectNodeContents(node);
          return [...område.getClientRects()];
        })
        .map((linje) => ({
          element,
          lag,
          rektangel: {
            left: Math.max(linje.left, ...rammer.map(({ left }) => left)),
            top: Math.max(linje.top, ...rammer.map(({ top }) => top)),
            right: Math.min(linje.right, ...rammer.map(({ right }) => right)),
            bottom: Math.min(
              linje.bottom,
              ...rammer.map(({ bottom }) => bottom),
            ),
          },
        }))
        .filter(
          ({ rektangel }) =>
            rektangel.right > rektangel.left &&
            rektangel.bottom > rektangel.top,
        );
    });
    const overlapp = linjer.flatMap((a, indeks) =>
      linjer
        .slice(indeks + 1)
        .filter(
          (b) =>
            a.lag === b.lag &&
            a.element !== b.element &&
            !a.element.contains(b.element) &&
            !b.element.contains(a.element) &&
            Math.min(a.rektangel.right, b.rektangel.right) -
              Math.max(a.rektangel.left, b.rektangel.left) >
              2 &&
            Math.min(a.rektangel.bottom, b.rektangel.bottom) -
              Math.max(a.rektangel.top, b.rektangel.top) >
              2,
        )
        .map((b) => `${navn.get(a.element)} / ${navn.get(b.element)}`),
    );
    return { klippet, overlapp: [...new Set(overlapp)] };
  });

  if (tap.klippet.length > 0 || tap.overlapp.length > 0) {
    await test.info().attach(`tekstavstand-${steg}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
  expect.soft(tap, `Tekstavstand i ${steg}`).toEqual({
    klippet: [],
    overlapp: [],
  });
  await stil.evaluate((element) => (element as Element).remove());
};

/* eslint-disable unicorn/consistent-function-scoping -- Funksjonen kjøres i nettleseren via page.evaluate og må inneholde hjelperne sine selv. */
const målIkkeTekstligKontrast = () => {
  type Rgba = [number, number, number, number];
  const lerret = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true })!;
  lerret.canvas.width = 1;
  lerret.canvas.height = 1;
  const tilRgba = (farge: string): Rgba => {
    lerret.clearRect(0, 0, 1, 1);
    lerret.fillStyle = "transparent";
    lerret.fillStyle = farge;
    lerret.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = lerret.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const leggOver = ([r, g, b, a]: Rgba, under: Rgba): Rgba => [
    r * a + under[0] * (1 - a),
    g * a + under[1] * (1 - a),
    b * a + under[2] * (1 - a),
    1,
  ];
  const bakgrunnBak = (element: Element | null): Rgba => {
    const lag: Rgba[] = [];
    for (let node = element; node; node = node.parentElement) {
      lag.push(tilRgba(getComputedStyle(node).backgroundColor));
    }
    let farge: Rgba = [255, 255, 255, 1];
    for (const over of lag.toReversed()) {
      farge = leggOver(over, farge);
    }
    return farge;
  };
  const luminans = ([r, g, b]: Rgba) => {
    const [rl, gl, bl] = [r, g, b].map((kanal) => {
      const verdi = kanal / 255;
      return verdi <= 0.040_45
        ? verdi / 12.92
        : ((verdi + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  };
  const kontrast = (a: Rgba, b: Rgba) => {
    const [lys, mørk] = [luminans(a), luminans(b)].toSorted((x, y) => y - x);
    return (lys + 0.05) / (mørk + 0.05);
  };
  const beskriv = (element: Element) =>
    `${element.tagName.toLowerCase()} «${(element.getAttribute("aria-label") ?? element.closest("label, button, a, .aksel-form-field, fieldset")?.textContent ?? "").trim().slice(0, 50)}»`;
  const synlig = (element: Element) =>
    element.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    });
  const piksler = (verdi: string) => Number(verdi.replace("px", ""));
  const avrund = (verdi: number) => Math.round(verdi * 100) / 100;
  const avvik: { element: string; del: string; kontrast: number }[] = [];
  const krev = (element: Element, del: string, verdi: number) => {
    if (verdi < 3) {
      avvik.push({ element: beskriv(element), del, kontrast: avrund(verdi) });
    }
  };

  const kantEllerFyll = (boks: Element) => {
    const stil = getComputedStyle(boks);
    const ytre = bakgrunnBak(boks.parentElement);
    const fyll = leggOver(tilRgba(stil.backgroundColor), ytre);
    const harKant =
      stil.borderTopStyle !== "none" && piksler(stil.borderTopWidth) > 0;
    const kant = leggOver(tilRgba(stil.borderTopColor), ytre);
    return Math.max(kontrast(fyll, ytre), harKant ? kontrast(kant, ytre) : 1);
  };
  const forfedre = (element: Element, antall: number) => {
    const liste: Element[] = [];
    for (
      let forelder = element.parentElement;
      forelder && liste.length < antall;
      forelder = forelder.parentElement
    ) {
      liste.push(forelder);
    }
    return liste;
  };
  const feltboks = (felt: Element) =>
    [felt, ...forfedre(felt, 3)].find(
      (kandidat) => kantEllerFyll(kandidat) >= 1.01,
    ) ?? felt;

  for (const felt of document.querySelectorAll(
    "main :is(input:not([type=hidden], [type=radio], [type=checkbox], [type=button], [type=submit]), textarea, select, input[type=radio], input[type=checkbox])",
  )) {
    if (
      !synlig(felt) ||
      (felt as HTMLInputElement).disabled ||
      (felt as HTMLInputElement).readOnly
    ) {
      continue;
    }
    krev(felt, "avgrensning", kantEllerFyll(feltboks(felt)));
    if (felt.matches("input[type=radio]:checked")) {
      const stil = getComputedStyle(felt);
      const ytre = bakgrunnBak(felt.parentElement);
      krev(
        felt,
        "valgt prikk",
        kontrast(
          leggOver(tilRgba(stil.backgroundColor), ytre),
          leggOver(tilRgba(stil.borderTopColor), ytre),
        ),
      );
    }
  }

  for (const spor of document.querySelectorAll("main .aksel-switch__track")) {
    if (!synlig(spor)) {
      continue;
    }
    krev(spor, "bryterspor", kantEllerFyll(spor));
    const knott = spor.querySelector(".aksel-switch__thumb");
    if (knott) {
      krev(
        spor,
        "bryterknott",
        kontrast(
          bakgrunnBak(knott),
          leggOver(
            tilRgba(getComputedStyle(spor).backgroundColor),
            bakgrunnBak(spor.parentElement),
          ),
        ),
      );
    }
  }

  for (const ikon of document.querySelectorAll(
    "main :is(button, a, [role=button], [aria-expanded], .aksel-select__container, .aksel-combobox__wrapper) svg",
  )) {
    if (!synlig(ikon) || ikon.getBoundingClientRect().width === 0) {
      continue;
    }
    const tegning = [ikon, ...ikon.querySelectorAll("*")]
      .flatMap((del) => {
        const { fill, stroke } = getComputedStyle(del);
        return [fill, stroke];
      })
      .map((farge) => tilRgba(farge))
      .find((farge) => farge[3] > 0);
    if (tegning) {
      const bak = bakgrunnBak(ikon.parentElement);
      krev(ikon, "ikon", kontrast(leggOver(tegning, bak), bak));
    }
  }

  const fokusEgenskaper = [
    "outlineStyle",
    "outlineWidth",
    "outlineColor",
    "outlineOffset",
    "boxShadow",
    "borderTopColor",
    "backgroundColor",
  ] as const;
  const øyeblikksbilde = (element: Element) =>
    [element, ...element.children, ...forfedre(element, 3)].flatMap((vert) =>
      [null, "::before", "::after"].map((pseudo) => {
        const stil = getComputedStyle(vert, pseudo);
        return {
          vert,
          pseudo,
          synlig: pseudo === null || stil.content !== "none",
          verdier: Object.fromEntries(
            fokusEgenskaper.map((egenskap) => [egenskap, stil[egenskap]]),
          ) as Record<(typeof fokusEgenskaper)[number], string>,
        };
      }),
    );
  const opprinneligFokus = document.activeElement as HTMLElement | null;
  const fokushendelser = ["focus", "blur", "focusin", "focusout"];
  const stoppHendelse = (hendelse: Event) =>
    hendelse.stopImmediatePropagation();
  for (const hendelse of fokushendelser) {
    globalThis.addEventListener(hendelse, stoppHendelse, { capture: true });
  }
  const fokuserbare = [
    ...document.querySelectorAll<HTMLElement>(
      "main :is(a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex='-1']))",
    ),
  ].filter(
    (element) => synlig(element) && !(element as HTMLButtonElement).disabled,
  );
  for (const element of fokuserbare) {
    const aktivt = document.activeElement as HTMLElement | null;
    aktivt?.blur();
    const før = øyeblikksbilde(element);
    element.focus({ focusVisible: true, preventScroll: true } as FocusOptions);
    if (document.activeElement !== element) {
      continue;
    }
    const etter = øyeblikksbilde(element);
    const indikatorer = etter.flatMap(
      ({ vert, synlig: vises, verdier }, indeks) => {
        const forrige = før[indeks].verdier;
        if (!vises) {
          return [];
        }
        const ytre = bakgrunnBak(vert.parentElement);
        const indre = bakgrunnBak(vert);
        const resultater: number[] = [];
        if (
          verdier.outlineStyle !== "none" &&
          piksler(verdier.outlineWidth) > 0 &&
          (verdier.outlineStyle !== forrige.outlineStyle ||
            verdier.outlineColor !== forrige.outlineColor ||
            verdier.outlineWidth !== forrige.outlineWidth)
        ) {
          const bak = piksler(verdier.outlineOffset) < 0 ? indre : ytre;
          resultater.push(
            kontrast(leggOver(tilRgba(verdier.outlineColor), bak), bak),
          );
        }
        if (
          verdier.boxShadow !== forrige.boxShadow &&
          verdier.boxShadow !== "none"
        ) {
          const bak = verdier.boxShadow.includes("inset") ? indre : ytre;
          const skyggefarger =
            verdier.boxShadow.match(
              /(?:rgba?|oklch|color)\([^)]*\)|#[\da-f]{3,8}/gi,
            ) ?? [];
          for (const farge of skyggefarger) {
            resultater.push(kontrast(leggOver(tilRgba(farge), bak), bak));
          }
        }
        if (verdier.borderTopColor !== forrige.borderTopColor) {
          resultater.push(
            kontrast(leggOver(tilRgba(verdier.borderTopColor), ytre), ytre),
          );
        }
        if (verdier.backgroundColor !== forrige.backgroundColor) {
          resultater.push(
            kontrast(leggOver(tilRgba(verdier.backgroundColor), ytre), ytre),
          );
        }
        return resultater;
      },
    );
    if (indikatorer.length === 0) {
      avvik.push({
        element: beskriv(element),
        del: "ingen fokusmarkering",
        kontrast: 1,
      });
    } else {
      krev(element, "fokusmarkering", Math.max(...indikatorer));
    }
  }
  if (opprinneligFokus && opprinneligFokus !== document.body) {
    opprinneligFokus.focus({ preventScroll: true });
  } else {
    const aktivt = document.activeElement as HTMLElement | null;
    aktivt?.blur();
  }
  for (const hendelse of fokushendelser) {
    globalThis.removeEventListener(hendelse, stoppHendelse, true);
  }
  return avvik;
};
/* eslint-enable unicorn/consistent-function-scoping */

export const sjekkIkkeTekstligKontrast = async (page: Page, steg: string) => {
  const avvik = await page.evaluate(målIkkeTekstligKontrast);
  await test.info().attach(`ikke-tekstlig-kontrast-${steg}`, {
    body: JSON.stringify(avvik, null, 2),
    contentType: "application/json",
  });
  expect
    .soft(avvik, `Kontrast for ikke-tekstlig innhold i ${steg}`)
    .toEqual([]);
};

type Fokusstopp = {
  nøkkel: string;
  navn: string;
  x: number;
  y: number;
  iVisning: boolean;
  fokusSynlig: boolean;
};

/* eslint-disable unicorn/consistent-function-scoping -- Funksjonene kjøres i nettleseren via page.evaluate og må inneholde hjelperne sine selv. */
const kartleggFokusstopp = () => {
  const fokuserbar =
    "a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex], [contenteditable=true]";
  const nøkkel = (element: Element) =>
    element.matches("input[type=radio]")
      ? `radio:${(element as HTMLInputElement).name}`
      : `element:${[...document.querySelectorAll("main *")].indexOf(element)}`;
  const forventet = [
    ...new Set(
      [...document.querySelectorAll<HTMLElement>(`main :is(${fokuserbar})`)]
        .filter(
          (element) =>
            element.checkVisibility({ visibilityProperty: true }) &&
            element.tabIndex >= 0 &&
            !(element as HTMLButtonElement).disabled &&
            !element.closest("[inert]"),
        )
        .map((element) => nøkkel(element)),
    ),
  ];
  const fokuserbareOgEtiketter = `:is(${fokuserbar}, label)`;
  // Pilen i Aksels Combobox er bare for mus. Listen åpnes med piltast fra feltet, se egen test.
  const harTastaturalternativ = ".aksel-combobox__button-toggle-list";
  const bareMus = [...document.querySelectorAll("main *")]
    .filter(
      (element) =>
        element.checkVisibility({ visibilityProperty: true }) &&
        getComputedStyle(element).cursor === "pointer" &&
        !element.closest(fokuserbareOgEtiketter) &&
        !element.closest(harTastaturalternativ) &&
        !element.querySelector(fokuserbar),
    )
    .map(
      (element) =>
        `${element.tagName.toLowerCase()} «${(element.textContent ?? "").trim().slice(0, 40)}»`,
    );
  const positiv = [...document.querySelectorAll<HTMLElement>("main [tabindex]")]
    .filter((element) => element.tabIndex > 0)
    .map((element) => element.outerHTML.slice(0, 80));
  return { forventet, bareMus, positivTabindex: positiv };
};

const lesFokus = (): Fokusstopp | null => {
  const element = document.activeElement;
  if (!element || !element.closest("main")) {
    return null;
  }
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return {
    nøkkel: element.matches("input[type=radio]")
      ? `radio:${(element as HTMLInputElement).name}`
      : `element:${[...document.querySelectorAll("main *")].indexOf(element)}`,
    navn: `${element.tagName.toLowerCase()} «${(element.getAttribute("aria-label") ?? element.closest("label, button, a, .aksel-form-field, fieldset")?.textContent ?? element.textContent ?? "").trim().slice(0, 50)}»`,
    x: left + scrollX,
    y: top + scrollY,
    iVisning: right > 0 && bottom > 0 && left < innerWidth && top < innerHeight,
    fokusSynlig: element.matches(":focus-visible"),
  };
};
/* eslint-enable unicorn/consistent-function-scoping */

const tabGjennomMain = async (page: Page, bakover: boolean) => {
  const tast = bakover ? "Shift+Tab" : "Tab";
  await page.evaluate((tilSlutt) => {
    const vakt = document.createElement("button");
    vakt.dataset.uuTastaturvakt = "";
    vakt.textContent = "Tastaturvakt";
    if (tilSlutt) {
      document.body.append(vakt);
    } else {
      document.body.prepend(vakt);
    }
    vakt.focus({ preventScroll: true });
  }, bakover);

  const stopp: Fokusstopp[] = [];
  let fastlåst = false;
  for (let steg = 0; steg < 400; steg++) {
    await page.keyboard.press(tast);
    const fokus = await page.evaluate(lesFokus);
    if (!fokus) {
      if (stopp.length > 0) {
        break;
      }
      continue;
    }
    if (stopp.at(-1)?.nøkkel === fokus.nøkkel) {
      fastlåst = true;
      break;
    }
    stopp.push(fokus);
  }
  await page.evaluate(() =>
    document.querySelector("[data-uu-tastaturvakt]")?.remove(),
  );
  return { stopp, fastlåst };
};

export const sjekkTastatur = async (page: Page, steg: string) => {
  const åpenDialog = page
    .locator("main :is(dialog[open], [role=dialog])")
    .filter({ visible: true });
  if ((await åpenDialog.count()) > 0) {
    return;
  }
  const før = await page.evaluate(() => ({
    url: location.href,
    h1: [...document.querySelectorAll("h1")].map(({ textContent }) =>
      textContent?.trim(),
    ),
    rulling: [scrollX, scrollY],
  }));
  const fokusFør = await page.evaluateHandle(() => document.activeElement);
  const { forventet, bareMus, positivTabindex } =
    await page.evaluate(kartleggFokusstopp);

  const forover = await tabGjennomMain(page, false);
  const bakover = await tabGjennomMain(page, true);
  const nøklerForover = forover.stopp.map(({ nøkkel }) => nøkkel);
  const navn = new Map(forover.stopp.map((s) => [s.nøkkel, s.navn]));

  const resultat = {
    ikkeNåddMedTab: forventet.filter((n) => !nøklerForover.includes(n)),
    bareMus,
    positivTabindex,
    tastaturfelle: forover.fastlåst || bakover.fastlåst,
    rekkefølgeAvvikerFraDom: nøklerForover.join(",") !== forventet.join(","),
    bakoverAvvikerFraForover:
      bakover.stopp
        .map(({ nøkkel }) => nøkkel)
        .toReversed()
        .join(",") !== nøklerForover.join(","),
    hopperOppover: forover.stopp
      .slice(1)
      .filter(
        (stopp, indeks) =>
          stopp.y < forover.stopp[indeks].y - 40 &&
          stopp.x <= forover.stopp[indeks].x,
      )
      .map(({ navn: n }) => n),
    usynligFokus: forover.stopp
      .filter(({ iVisning, fokusSynlig }) => !iVisning || !fokusSynlig)
      .map(({ navn: n }) => n),
  };

  const etter = await page.evaluate(() => ({
    url: location.href,
    h1: [...document.querySelectorAll("h1")].map(({ textContent }) =>
      textContent?.trim(),
    ),
  }));
  await fokusFør.evaluate((element, [x, y]) => {
    (element as HTMLElement | null)?.focus?.({ preventScroll: true });
    scrollTo(x, y);
  }, før.rulling);

  await test.info().attach(`tastatur-${steg}`, {
    body: JSON.stringify(
      {
        ...resultat,
        fokusrekkefølge: forover.stopp.map(({ navn: n }) => n),
        ikkeNåddMedTabNavn: resultat.ikkeNåddMedTab.map(
          (n) => navn.get(n) ?? n,
        ),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
  expect
    .soft(
      {
        ...resultat,
        kontekstEndret:
          etter.url !== før.url || etter.h1.join(",") !== før.h1.join(","),
      },
      `Tastatur og fokus i ${steg}`,
    )
    .toEqual({
      ikkeNåddMedTab: [],
      bareMus: [],
      positivTabindex: [],
      tastaturfelle: false,
      rekkefølgeAvvikerFraDom: false,
      bakoverAvvikerFraForover: false,
      hopperOppover: [],
      usynligFokus: [],
      kontekstEndret: false,
    });
};

const KONTROLLER =
  "button, a[href], [role=button], [role=link], [role=switch], [role=tab], input:not([type=hidden]), select, textarea";

const normaliser = (tekst: string) =>
  tekst
    .toLocaleLowerCase("nb")
    .replaceAll(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export const sjekkLedetekstINavn = async (page: Page, steg: string) => {
  const kontroller = page.getByRole("main").locator(KONTROLLER);
  // innerText gir bare synlig tekst, i motsetning til textContent.
  /* eslint-disable unicorn/prefer-dom-node-text-content */
  const synligeTekster = await kontroller.evaluateAll((elementer) =>
    elementer.map((element) => {
      if (!element.checkVisibility({ visibilityProperty: true })) {
        return null;
      }
      const etiketter =
        "labels" in element
          ? [...((element as HTMLInputElement).labels ?? [])]
          : [];
      const tekst =
        etiketter.length > 0
          ? etiketter.map((etikett) => etikett.innerText).join(" ")
          : element.matches("input, select, textarea")
            ? ""
            : (element as HTMLElement).innerText;
      return tekst.trim() === "" ? null : tekst;
    }),
  );
  /* eslint-enable unicorn/prefer-dom-node-text-content */

  const avvik: { synlig: string; navn: string }[] = [];
  for (const [indeks, synlig] of synligeTekster.entries()) {
    if (synlig === null) {
      continue;
    }
    const øyeblikksbilde = await kontroller.nth(indeks).ariaSnapshot();
    const [førsteLinje] = øyeblikksbilde.split("\n");
    const navn = /^- [\w-]+ "((?:[^"\\]|\\.)*)"/.exec(førsteLinje)?.[1] ?? "";
    if (!normaliser(navn).includes(normaliser(synlig))) {
      avvik.push({ synlig: synlig.trim(), navn });
    }
  }
  expect.soft(avvik, `Ledetekst i navn i ${steg}`).toEqual([]);
};

/* eslint-disable unicorn/consistent-function-scoping -- Funksjonen kjøres i nettleseren via page.evaluate og må inneholde hjelperne sine selv. */
const finnSyntaksfeil = () => {
  const beskriv = (element: Element) =>
    `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""} «${(element.textContent ?? "").trim().slice(0, 40)}»`;

  // Utviklerverktøyene til TanStack vises bare lokalt og har like ID-er i logoene sine.
  const utviklerverktøy = ".tsqd-parent-container, .TanStackRouterDevtools";
  const antallPerId = new Map<string, number>();
  for (const element of document.querySelectorAll("[id]")) {
    const { id } = element;
    if (id !== "" && !element.closest(utviklerverktøy)) {
      antallPerId.set(id, (antallPerId.get(id) ?? 0) + 1);
    }
  }
  const dupliserteIder = [...antallPerId]
    .filter(([, antall]) => antall > 1)
    .map(([id, antall]) => `${id} (${antall})`);

  const blokk =
    "address, article, aside, blockquote, details, dialog, div, dl, fieldset, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, main, nav, ol, p, pre, section, table, ul";
  const interaktiv =
    "a[href], button, input:not([type=hidden]), select, textarea, label, iframe, details, [tabindex]:not([tabindex='-1'])";
  // Lister og dl dekkes av axe-reglene list, listitem, dlitem og definition-list.
  const regler: {
    navn: string;
    selektor: string;
    ok?: (e: Element) => boolean;
  }[] = [
    { navn: "blokkelement i p", selektor: `p :is(${blokk})` },
    {
      navn: "blokkelement i overskrift",
      selektor: `:is(h1, h2, h3, h4, h5, h6) :is(${blokk})`,
    },
    {
      navn: "interaktivt element i lenke eller knapp",
      selektor: `:is(a[href], button) :is(${interaktiv})`,
    },
    { navn: "label i label", selektor: "label label" },
    { navn: "skjema i skjema", selektor: "form form" },
    { navn: "main i main", selektor: "main main" },
    {
      navn: "ugyldig barn av tabellrad",
      selektor: "tr > *",
      ok: (e) => e.matches("td, th, script, template"),
    },
  ];
  const feilNøsting = regler.flatMap(({ navn, selektor, ok }) =>
    [...document.querySelectorAll(selektor)]
      .filter((element) => !ok?.(element))
      .map((element) => `${navn}: ${beskriv(element)}`),
  );
  return { dupliserteIder, feilNøsting: [...new Set(feilNøsting)] };
};
/* eslint-enable unicorn/consistent-function-scoping */

export const sjekkKodesyntaks = async (page: Page, steg: string) => {
  expect
    .soft(await page.evaluate(finnSyntaksfeil), `Kodesyntaks i ${steg}`)
    .toEqual({ dupliserteIder: [], feilNøsting: [] });
};

const ENKELTTEGN = [..."abcdefghijklmnopqrstuvwxyz0123456789?/.,-+"];

export const sjekkHurtigtaster = async (page: Page, steg: string) => {
  const fokusFør = await page.evaluateHandle(() => document.activeElement);
  const tilstand = () =>
    page.evaluate(() => ({
      url: location.href,
      innhold: document.querySelector("main")!.getHTML(),
      fokus: (document.activeElement ?? document.body).tagName,
      dialoger: document.querySelectorAll(
        "dialog[open], [role=dialog], [role=listbox], [popover]:popover-open",
      ).length,
      rulling: [scrollX, scrollY],
    }));
  await page.evaluate(() => {
    const aktivt = document.activeElement as HTMLElement | null;
    aktivt?.blur();
  });
  const før = await tilstand();
  for (const tegn of ENKELTTEGN) {
    await page.keyboard.press(tegn);
  }
  expect
    .soft(await tilstand(), `Hurtigtaster med ett tegn i ${steg}`)
    .toEqual(før);
  await fokusFør.evaluate((element) =>
    (element as HTMLElement | null)?.focus?.({ preventScroll: true }),
  );
};

export const sjekkBevegelse = async (page: Page, steg: string) => {
  const funn = await page.evaluate(() => {
    // eslint-disable-next-line unicorn/consistent-function-scoping -- Kjøres i nettleseren via page.evaluate.
    const beskriv = (element: Element | null) =>
      element
        ? `${element.tagName.toLowerCase()}.${String(element.className).split(" ")[0]} «${(element.textContent ?? "").trim().slice(0, 30)}»`
        : "ukjent";
    const animasjoner = document
      .getAnimations()
      .filter((animasjon) => animasjon.playState === "running")
      .map((animasjon) => {
        const { iterations, duration } =
          animasjon.effect?.getComputedTiming() ?? {};
        const mål = (animasjon.effect as KeyframeEffect | null)?.target ?? null;
        return {
          element: beskriv(mål),
          iMain: Boolean(mål?.closest("main")),
          uendelig: iterations === Infinity,
          varighetMs: Number(duration) * Number(iterations),
          rundeMs: Number(duration),
        };
      })
      .filter(({ iMain }) => iMain);
    return {
      varerOver5Sekunder: animasjoner
        .filter(({ uendelig, varighetMs }) => uendelig || varighetMs > 5000)
        .map(({ element }) => element),
      merEnnTreGlimtPerSekund: animasjoner
        .filter(({ rundeMs }) => rundeMs > 0 && rundeMs < 1000 / 3)
        .map(({ element }) => element),
      medier: [...document.querySelectorAll("main :is(video, audio)")].map(
        (element) => beskriv(element),
      ),
    };
  });
  expect.soft(funn, `Bevegelse og glimt i ${steg}`).toEqual({
    varerOver5Sekunder: [],
    merEnnTreGlimtPerSekund: [],
    medier: [],
  });
};

export const sjekkFeilmeldinger = async (page: Page, steg: string) => {
  /* eslint-disable unicorn/consistent-function-scoping -- Kjøres i nettleseren via page.evaluate. */
  const funn = await page.evaluate(() => {
    const synlig = (element: Element) =>
      element.checkVisibility({ visibilityProperty: true }) &&
      (element.textContent ?? "").trim() !== "";
    const beskrivelser = (element: Element) =>
      (element.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.querySelector(`#${CSS.escape(id)}`))
        .filter((beskrivelse): beskrivelse is Element => beskrivelse !== null);
    const felt = [
      ...document.querySelectorAll("main :is(input, select, textarea)"),
    ];

    const feilUtenFelt = [
      ...document.querySelectorAll("main .aksel-error-message"),
    ]
      .filter((melding) => synlig(melding))
      .filter((melding) => {
        const koblet = felt.filter((kontroll) =>
          beskrivelser(kontroll).some((beskrivelse) =>
            beskrivelse.contains(melding),
          ),
        );
        return koblet.every(
          (kontroll) =>
            !(
              kontroll.getAttribute("aria-invalid") === "true" ||
              kontroll.closest("fieldset")?.getAttribute("aria-invalid") ===
                "true"
            ),
        );
      })
      .map((melding) => (melding.textContent ?? "").trim());

    const ugyldigUtenFeil = [
      ...document.querySelectorAll(
        "main :is(input, select, textarea, fieldset)[aria-invalid=true]",
      ),
    ]
      .filter((element) => {
        const kontroller =
          element.tagName === "FIELDSET"
            ? [...element.querySelectorAll("input, select, textarea")]
            : [element];
        return kontroller.every((kontroll) =>
          beskrivelser(kontroll).every((beskrivelse) => !synlig(beskrivelse)),
        );
      })
      .map(
        (element) =>
          `${element.tagName.toLowerCase()}#${element.id} «${(element.closest(".aksel-form-field, fieldset")?.textContent ?? "").trim().slice(0, 40)}»`,
      );
    return { feilUtenFelt, ugyldigUtenFeil };
  });
  /* eslint-enable unicorn/consistent-function-scoping */
  expect
    .soft(funn, `Feilmeldinger koblet til felt i ${steg}`)
    .toEqual({ feilUtenFelt: [], ugyldigUtenFeil: [] });
};

type Statusovervåking = {
  sisteHandling: string;
  funn: string[];
};

const overvåkStatusbeskjeder = () => {
  const vindu = globalThis as typeof globalThis & {
    uuStatusbeskjeder?: Statusovervåking;
  };
  if (vindu.uuStatusbeskjeder) {
    return;
  }
  const tilstand: Statusovervåking = { sisteHandling: "", funn: [] };
  vindu.uuStatusbeskjeder = tilstand;
  for (const type of ["click", "input", "change", "keydown"]) {
    addEventListener(
      type,
      (hendelse) => {
        if (hendelse.isTrusted) {
          tilstand.sisteHandling = location.href;
        }
      },
      true,
    );
  }
  // Lasteindikatoren i Aksels Button (loading) er unntatt. Knappen beholder fokus og navnet endres til «Venter…».
  const statusbeskjed =
    ".aksel-alert, .aksel-loader:not(button .aksel-loader), .aksel-error-message";
  const liveRegion =
    "[role=alert], [role=status], [role=log], [role=progressbar], output, [aria-live=polite], [aria-live=assertive]";
  new MutationObserver((endringer) => {
    if (tilstand.sisteHandling !== location.href) {
      return;
    }
    const nyeNoder = endringer.flatMap(({ addedNodes }) => [...addedNodes]);
    for (const node of nyeNoder) {
      if (!(node instanceof Element) || !node.closest("main")) {
        continue;
      }
      const beskjeder = [node, ...node.querySelectorAll(statusbeskjed)].filter(
        (element) => element.matches(statusbeskjed),
      );
      for (const beskjed of beskjeder) {
        if (!beskjed.closest(liveRegion)) {
          tilstand.funn.push(
            `${String(beskjed.className).split(" ")[0]} «${(beskjed.textContent ?? "").trim().slice(0, 60)}»`,
          );
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });
};

const overvåkedeSider = new WeakSet<Page>();

export const sjekkStatusbeskjeder = async (page: Page, steg: string) => {
  if (!overvåkedeSider.has(page)) {
    overvåkedeSider.add(page);
    await page.addInitScript(overvåkStatusbeskjeder);
  }
  await page.evaluate(overvåkStatusbeskjeder);
  const funn = await page.evaluate(() => {
    const tilstand = (
      globalThis as typeof globalThis & { uuStatusbeskjeder: Statusovervåking }
    ).uuStatusbeskjeder;
    const resultat = [...new Set(tilstand.funn)];
    tilstand.funn = [];
    return resultat;
  });
  expect.soft(funn, `Statusbeskjeder uten live-region før ${steg}`).toEqual([]);
};

export const sjekkUniversellUtforming = async (page: Page, steg: string) => {
  await test.step(`Axe: ${steg}`, async () => {
    await expect(page.getByRole("main")).toBeVisible();
    await sjekkStatusbeskjeder(page, steg);
    await sjekkSidetittel(page, steg);
    await sjekkSpråk(page, steg);
    await sjekkTekstavstand(page, steg);
    await sjekkIkkeTekstligKontrast(page, steg);
    await sjekkTastatur(page, steg);
    await sjekkLedetekstINavn(page, steg);
    await sjekkKodesyntaks(page, steg);
    await sjekkHurtigtaster(page, steg);
    await sjekkBevegelse(page, steg);
    await sjekkFeilmeldinger(page, steg);

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

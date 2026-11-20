# Playwright Tester

End-to-end tester for inntektsmelding-frontend. Testmappen er organisert etter samme struktur som `src/features/`.

Playwright er et verktøy for å lage og kjøre ende-til-ende tester for webapplikasjoner. Vi bruker dette til å teste vår frontend.

Du kan lære mer om playwright [her](https://playwright.dev/).

For å kjøre tester lokalt, må du først ha installert Playwright. Det gjør du med:

```bash
yarn dlx playwright install
```

## Axe-tester for universell utforming

Kjør testene fra `app/`:

```bash
yarn test:uu
```

Testene er merket med `@uu` og kjører også med `yarn test:e2e` og i eksisterende CI. De bruker [felles axe-kontroll](./e2e/uu.ts) i fire skjemaflyter:

- Vanlig inntektsmelding fra dine opplysninger til kvittering.
- Arbeidsgiverinitiert inntektsmelding for nyansatte fra inngang til kvittering.
- Arbeidsgiverinitiert inntektsmelding unntatt Aa-registeret fra inngang til kvittering.
- Refusjon for omsorgspenger fra intro til kvittering.

Kontrollene dekker også utvalgte dynamiske tilstander: registreringsgrunnlag, arbeidsgivervalg, refusjonsvarsel, refusjonsbeløp, fraværsperiode, endret månedsinntekt og valideringsfeil.

Testene dekker også visning av innsendte inntektsmeldinger og refusjonskrav i alle fire flyter.

Axe skanner `main` med taggene `wcag2a`, `wcag2aa`, `wcag21a` og `wcag21aa`. Ingen regler er deaktivert. Vi avgrenser til hovedinnholdet fordi Vite-testene ikke har produksjonens dekoratør, og utviklerverktøyene ligger utenfor skjemaene. Kontroll av hele dokumentet, dekoratør og innlogging må gjøres separat.

Hver skanning legger ved en JSON-rapport i Playwrights HTML-rapport under `app/playwright-report/`. Vedlegget inneholder axe-funn (`violations`), forhold som krever manuell vurdering (`incomplete`), URL, tidspunkt og axe-versjon. CI laster opp HTML-rapporten med vedlegg som artefakten `playwright-report`. Åpne rapporten lokalt fra `app/` med `yarn exec playwright show-report`.

Testene fortsetter å skanne senere steg etter axe-funn, men hele testen feiler hvis én skanning har avvik. Kjøringen kan derfor avdekke flere feil samtidig. Eksisterende avvik skal rettes, ikke skjules med unntak eller deaktiverte regler. Rapporter bruker mockede testdata; ikke kjør oppsettet mot personopplysninger.

Ingen funn fra axe er ikke en UU-godkjenning. Skjermleser, tastatur, reflow, de øvrige variantene og alle `incomplete`-funn må vurderes manuelt. Testen «Valideringsfeil og endring av inntekt» kontrollerer også at feltet «Endret månedsinntekt» beholder ledeteksten som tilgjengelig navn etter utfylling og ugyldig verdi. Den kontrollen beskytter mot en feil axe alene ikke nødvendigvis finner. Se [sjekklisten for universell utforming](../../UNIVERSELL_UTFORMING.md).

## Struktur

````
tests/
├── e2e/                         # Playwright E2E tester
│   ├── arbeidsgiverinitiert/    # AGI-tester (24 tester)
│   ├── inntektsmelding/         # Vanlige inntektsmelding-tester (8 tester)
│   └── shared/                  # Delte tester (1 test)
└── mocks/                       # Mock-data for API-endepunkter
    ├── arbeidsgiverinitiert/    # AGI-spesifikke mocks
    ├── inntektsmelding/         # Inntektsmelding-mocks
    └── shared/                  # Delte mocks og utilities

## Kjøre tester

```bash
# Alle tester
npm run test:e2e

# Feature-spesifikke tester
npm run test:e2e -- tests/e2e/arbeidsgiverinitiert/
npm run test:e2e -- tests/e2e/inntektsmelding/

# Spesifikk testfil
npm run test:e2e -- agi-happy-path
npm run test:e2e -- happy-path

# Med UI for debugging
npm run test:e2e:ui

# Kun headless (raskere)
npm run test:e2e -- --headed=false
````

## Playwright-oppsett

Testene bruker Playwright med:

- **Chromium** som standard browser
- **Automatisk mocking** av API-endepunkter
- **Page Object Model** for gjenbrukbare komponenter
- **Parallell kjøring** for raskere tester

## Mock-system

Alle API-kall mockes automatisk:

- `mockOpplysninger()` - Mocker opplysninger-endepunkt
- `mockGrunnbeløp()` - Mocker grunnbeløp fra G-API
- `mockHentPersonOgArbeidsforhold()` - Mocker person-oppslag
- `mockAGIOpplysninger()` - Mocker AGI-spesifikke endepunkter

## Nye tester

- **Feature-tester** → `tests/e2e/{feature}/`
- **Delte tester** → `tests/e2e/shared/`
- **Mocks** → `tests/mocks/{feature}/` eller `tests/mocks/shared/`

## Debugging

```bash
<<<<<<< HEAD
# Kjør med UI for å se hva som skjer
npm run test:e2e:ui
=======
yarn test:e2e:ui
```

> > > > > > > origin/master

# Kjør spesifikk test med debug

npm run test:e2e -- agi-happy-path --debug

# Se test-rapport etter kjøring

npx playwright show-report

```

```

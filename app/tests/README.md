# Tester

Kjør kommandoene fra `app/`. E2E-testene bruker Playwright med Chromium og mockede API-svar.

```bash
# Installer nettleseren ved første oppsett
yarn exec playwright install chromium

# Funksjonelle E2E-tester
yarn test:e2e

# UU-suiten
yarn test:uu

# Alle Playwright-prosjekter
yarn exec playwright test

# Én flyt eller testfil
yarn test:e2e tests/e2e/inntektsmelding/

# Interaktiv kjøring
yarn test:e2e:ui

# Åpne rapporten etter kjøring
yarn exec playwright show-report
```

## Universell utforming

Kjør `yarn test:uu`. Suiten gjenbruker flyter og mocker fra E2E-testene, men kjører i egne Playwright-prosjekter og en egen CI-jobb, parallelt med funksjonstestene:

- `uu`: axe, overskrifter, sidetitler, sidespråk, tekstavstand, navngitte feltgrupper, kontaktpersonens `autocomplete`, feil, feilsider, åpne kontroller og kontrast ved hover og tastaturfokus.
- `uu-smal`: de samme flytene ved 320 × 256 CSS-piksler. Egen regresjonstest kontrollerer vannrett rulling ved 320, 768 og 800 piksler.
- `uu-zoom`: full innsending av vanlig inntektsmelding ved ekte 200 % og 400 % nettleserzoom. En lokal testutvidelse styrer Chromium i en isolert profil. Testene sammenligner synlig tekst med 100 %, kontrollerer vannrett rulling og verifiserer faktisk zoom.

Alle fire skjemaflyter og visning av innsendte skjemaer inngår. Tester merket `@kjent-avvik` gjengir navnløs virksomhetsliste i Aksel (4.1.2) og for brede datoperioder (1.4.10). Bare den avsluttende kravkontrollen har forventet feil; oppsett og øvrige kontroller skal bestå. Hvis kravet blir oppfylt, feiler testen som «unexpected pass», og markeringen må fjernes.

CI lagrer separate rapporter som `playwright-report-e2e` og `playwright-report-uu`, med JSON-vedlegg fra axe og zoommålinger i UU-rapporten. Jobbene avbryter ikke hverandre ved feil.

Grønne tester er ikke en UU-godkjenning. Skjermleser, bilder av tekst, informasjon som bare formidles med farge, visuell klipping og axe-funn merket `incomplete` krever fortsatt manuell vurdering. Se [UU-sjekklisten](../../UNIVERSELL_UTFORMING.md).

## Nye tester

Legg tester i `tests/e2e/{feature}/` og mock-data i `tests/mocks/{feature}/`. Bruk rolle- og labelbaserte selektorer og [felles axe-kontroll](./e2e/uu.ts) for UU-tester.

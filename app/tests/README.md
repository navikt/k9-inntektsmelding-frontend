# Tester

Kjør kommandoene fra `app/`. E2E-testene bruker Playwright med Chromium og mockede API-svar.

```bash
# Installer nettleseren ved første oppsett
yarn exec playwright install chromium

# Alle E2E-tester
yarn test:e2e

# Én flyt eller testfil
yarn test:e2e tests/e2e/inntektsmelding/

# Interaktiv kjøring
yarn test:e2e:ui

# Åpne rapporten etter kjøring
yarn exec playwright show-report
```

## Universell utforming

Kjør `yarn test:uu`. Testene er merket `@uu` og inngår også i vanlig E2E-kjøring og CI.

De kontrollerer hovedinnholdet i de fire skjemaflytene og visning av innsendte skjemaer med axe og egne strukturkontroller. HTML-rapporten inneholder JSON-vedlegg fra axe og lastes opp i CI som `playwright-report`.

Grønne tester er ikke en UU-godkjenning. Vurder `incomplete`-funn manuelt og følg [UU-sjekklisten](../../UNIVERSELL_UTFORMING.md).

## Nye tester

Legg tester i `tests/e2e/{feature}/` og mock-data i `tests/mocks/{feature}/`. Bruk rolle- og labelbaserte selektorer og [felles axe-kontroll](./e2e/uu.ts) for UU-tester.

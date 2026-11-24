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

- `uu`: UU-testene under, i vanlig desktopbredde.
- `uu-smal`: de samme flytene ved 320 × 256 CSS-piksler. Egen regresjonstest kontrollerer vannrett rulling ved 320, 768 og 800 piksler.
- `uu-zoom`: full innsending av vanlig inntektsmelding ved ekte 200 % og 400 % nettleserzoom. En lokal testutvidelse styrer Chromium i en isolert profil. Testene sammenligner synlig tekst med 100 %, kontrollerer vannrett rulling og verifiserer faktisk zoom.

Alle fire skjemaflyter og visning av innsendte skjemaer inngår. Tester merket `@kjent-avvik` gjengir navnløs virksomhetsliste i Aksel (4.1.2) og for brede datoperioder (1.4.10). Bare den avsluttende kravkontrollen har forventet feil; oppsett og øvrige kontroller skal bestå. Hvis kravet blir oppfylt, feiler testen som «unexpected pass», og markeringen må fjernes.

### Felles kontroll ved hvert sjekkpunkt

`sjekkUniversellUtforming` i [uu.ts](./e2e/uu.ts) kjøres ved hvert sjekkpunkt i UU-testene. Den kjører disse kontrollene:

| Kontroll | WCAG | Hva den tester |
| --- | --- | --- |
| Struktur | [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90) | Synlig `main`, nøyaktig én h1 og ingen hopp i overskriftsnivåer. |
| `finnWcagAvvik` | Flere | Axe med WCAG 2.0 og 2.1 A og AA i `main`. Resultatet legges ved rapporten. |
| `sjekkSidetittel` | [2.4.2](https://www.uutilsynet.no/wcag-standarden/242-sidetitler-niva/104) | Én `<title>` med forventet tittel for ruten, også etter navigering. |
| `sjekkSpråk` | [3.1.1](https://www.uutilsynet.no/wcag-standarden/311-sprak-pa-siden-niva/110), [3.1.2](https://www.uutilsynet.no/wcag-standarden/312-sprak-pa-deler-av-innhold-niva-aa/111) | `lang="nb-no"` og axe-reglene for språk på hele dokumentet. |
| `sjekkTekstavstand` | [1.4.12](https://www.uutilsynet.no/wcag-standarden/1412-tekstavstand-niva-aa/146) | Legger på WCAG-avstandene for tekst og ser etter tekst som klippes eller overlapper. |
| `sjekkIkkeTekstligKontrast` | [1.4.11](https://www.uutilsynet.no/wcag-standarden/1411-kontrast-ikke-tekstlig-innhold-niva-aa/145) | Minst 3:1 for feltkanter, valgte radioknapper, bryter, ikoner og fokusmarkering. |
| `sjekkTastatur` | [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98), [2.1.2](https://www.uutilsynet.no/wcag-standarden/212-ingen-tastaturfelle-niva/99), [2.4.3](https://www.uutilsynet.no/wcag-standarden/243-fokusrekkefolge-niva/105), [2.4.7](https://www.uutilsynet.no/wcag-standarden/247-synlig-fokus-niva-aa/109), [3.2.1](https://www.uutilsynet.no/wcag-standarden/321-fokus-niva/112) | Tabber gjennom `main` forover og bakover. Alle kontroller skal nås i DOM-rekkefølge uten felle og med synlig fokus. Ingenting skal bare kunne brukes med mus, og fokus skal ikke endre adresse eller h1. |
| `sjekkLedetekstINavn` | [2.5.3](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150) | Synlig tekst eller ledetekst skal finnes i det tilgjengelige navnet. |
| `sjekkKodesyntaks` | [4.1.1](https://www.uutilsynet.no/wcag-standarden/411-parsing-oppdeling-niva/120) | Like ID-er og feil nøsting, for eksempel `div` i overskrifter eller knapp i knapp. |
| `sjekkHurtigtaster` | [2.1.4](https://www.uutilsynet.no/wcag-standarden/214-hurtigtaster-som-bestar-av-ett-tegn-niva/782) | Trykker a–z, 0–9 og vanlige tegn uten fokus i felt. Ingenting skal endre seg. |
| `sjekkBevegelse` | [2.2.2](https://www.uutilsynet.no/wcag-standarden/222-pause-stopp-skjul-niva/101), [2.3.1](https://www.uutilsynet.no/wcag-standarden/231-terskelverdi-pa-maksimalt-tre-glimt-niva/102) | Ingen animasjoner over fem sekunder eller med mer enn tre runder per sekund, og ingen video eller lyd. |
| `sjekkStatusbeskjeder` | [4.1.3](https://www.uutilsynet.no/wcag-standarden/413-statusbeskjeder-niva-aa/152) | Varsler, lasteindikatorer og feilmeldinger som dukker opp etter en handling på samme side, skal ligge i `role="alert"`, `role="status"` eller `aria-live`. Overvåkingen starter ved første sjekkpunkt. |
| `sjekkInnholdVedPekerOgFokus` | [1.4.13](https://www.uutilsynet.no/wcag-standarden/1413-pekerfolsomt-innhold-eller-innhold-ved-tastaturfokus-niva-aa/147) | Setter fokus på og holder pekeren over hvert element i `main` som kan få fokus. Nytt innhold i `main` eller i et lag over siden rapporteres. Ikonknapper uten synlig tekst får 200 ms ventetid, fordi Aksels `Tooltip` åpnes etter 150 ms. Hver side kontrolleres én gang per worker. |
| `sjekkKonsekventNavigering` | [3.2.3](https://www.uutilsynet.no/wcag-standarden/323-konsekvent-navigering-niva-aa/113), [3.2.4](https://www.uutilsynet.no/wcag-standarden/324-konsekvent-identifikasjon-niva-aa/115) | Husker lenker og knapper fra tidligere sjekkpunkter i samme test. Elementer som går igjen, skal stå i samme rekkefølge, og lenker til samme adresse skal ha samme navn. «Avbryt» og «Forrige steg» er unntatt fra navnekontrollen. |
| `sjekkLedetekster` | [3.3.2](https://www.uutilsynet.no/wcag-standarden/332-ledetekster-eller-instruksjoner-niva/117) | Hvert synlige felt i `main` har en synlig `<label>` med tekst rett ved feltet, eventuelt med en beskrivelse imellom, og radiogrupper har et synlig spørsmål i `legend`. «Alle felt må fylles ut.» står før første felt. |
| `sjekkFeilmeldinger` | [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116), [3.3.3](https://www.uutilsynet.no/wcag-standarden/333-forslag-ved-feil-niva-aa/118) | Hver synlige feilmelding er koblet til et felt med `aria-invalid`, og hvert ugyldig felt har en synlig feilmelding. Et felt med innhold skal ikke ha en melding om at verdien mangler, for eksempel «Må oppgis». |

`sjekkIngenVannrettRulling` ([1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144)) kjøres for seg der testene ber om det.

### UU-testene

| Test | Hva den tester | WCAG |
| --- | --- | --- |
| [Inntektsmelding: Enklest mulige utfylling](./e2e/inntektsmelding/happy-path.spec.tsx) | Felles kontroll i alle steg fra Dine opplysninger til kvittering. Kontaktpersonen har `autocomplete="name"` og `"tel"`. | Felles, [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) |
| [Inntektsmelding: Valideringsfeil og endring av inntekt](./e2e/inntektsmelding/happy-path.spec.tsx) | Felles kontroll med valideringsfeil og åpent felt for endret månedsinntekt. | Felles, [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116) |
| [Inntektsmelding: Gjentakende refusjon og naturalytelser](./e2e/inntektsmelding/happy-path.spec.tsx) | Feltgruppene for tre refusjonsperioder og to naturalytelser har navn. Sletting virker. | Felles, [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90), [2.5.3](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150) |
| [Inntektsmelding: Skjemaet krever ikke vannrett rulling](./e2e/inntektsmelding/happy-path.spec.tsx) | Ingen vannrett rulling ved 320, 768 og 800 piksler i Dine opplysninger, Inntekt og refusjon og med åpent felt for endret månedsinntekt. | [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144) |
| [AGI nyansatt](./e2e/arbeidsgiverinitiert/nyansatt/agi-happy-path.spec.tsx) og [AGI unntatt Aa-registeret](./e2e/arbeidsgiverinitiert/uregistrert/happy-path.spec.tsx) | Felles kontroll i hele flyten fra opprettelse til kvittering, og `autocomplete` for kontaktpersonen. | Felles, [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) |
| [Refusjon av omsorgspenger](./e2e/refusjon-omsorgspenger/happy-path.spec.tsx) | Felles kontroll i alle seks steg, med åpen hjelpetekst og delvis fraværsdag. | Felles, [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) |
| Vis-rutene for [inntektsmelding](./e2e/inntektsmelding/vis.spec.tsx), [AGI nyansatt](./e2e/arbeidsgiverinitiert/nyansatt/vis.spec.tsx), [AGI unntatt Aa-registeret](./e2e/arbeidsgiverinitiert/uregistrert/vis.spec.tsx) og [omsorgspenger](./e2e/refusjon-omsorgspenger/vis.spec.tsx) | Felles kontroll på visning av innsendte skjemaer. | Felles |
| [Åpne kontroller og serverfeil](./e2e/uu-regresjoner.spec.tsx) | Åpen stegoversikt og kalender, endringslenke ved hover og tastaturfokus, og feil fra serveren ved innsending. | Felles, [1.4.3](https://www.uutilsynet.no/wcag-standarden/143-kontrast-minimum-niva-aa/95), [2.4.7](https://www.uutilsynet.no/wcag-standarden/247-synlig-fokus-niva-aa/109) |
| [Feilsider](./e2e/uu-regresjoner.spec.tsx) | Utgått oppgave, generell feil og 404 både inne i og utenfor skjemaet. Riktig tittel, én h1 og `lang="en"` på engelsk tekst. | Felles, [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90), [2.4.2](https://www.uutilsynet.no/wcag-standarden/242-sidetitler-niva/104), [3.1.2](https://www.uutilsynet.no/wcag-standarden/312-sprak-pa-deler-av-innhold-niva-aa/111) |
| [Kalenderen med tastatur](./e2e/uu-regresjoner.spec.tsx) | Kalenderen åpnes med Enter, holder fokus, lukkes med Escape og gir fokus tilbake. Dag kan velges med piltast og Enter. | [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98), [2.1.2](https://www.uutilsynet.no/wcag-standarden/212-ingen-tastaturfelle-niva/99), [2.4.3](https://www.uutilsynet.no/wcag-standarden/243-fokusrekkefolge-niva/105) |
| [Virksomhetslisten med tastatur](./e2e/uu-regresjoner.spec.tsx) | Listen åpnes med pil ned, og virksomhet velges med Enter. Begrunner unntaket for pilen i `sjekkTastatur`. | [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98) |
| [Stående og liggende retning](./e2e/uu-regresjoner.spec.tsx) | Samme innhold ved 360 × 640 og 640 × 360, ingen vannrett rulling, ingen CSS for retning og ingen låsing av retning. | [1.3.4](https://www.uutilsynet.no/wcag-standarden/134-visningsretning-niva-aa/141) |
| [Endring av verdier gir ingen kontekstendring](./e2e/uu-regresjoner.spec.tsx) | Endrer alle felt i Dine opplysninger, Inntekt og refusjon, Opprett inntektsmelding og steg 1–3 i omsorgspenger. Adresse, hovedoverskrift og vinduer skal være uendret, og fokus skal bli i feltet. | [3.2.2](https://www.uutilsynet.no/wcag-standarden/322-inndata-niva/114) |
| [Ugyldig dato gir forslag til riktig format](./e2e/uu-regresjoner.spec.tsx) | Skriver «31.02.2024» i første fraværsdag i AGI og ugyldige datoer i en fraværsperiode i omsorgspenger. Feilmeldingen skal foreslå formatet dd.mm.åååå, og teksten skal bli stående. | Felles, [3.3.3](https://www.uutilsynet.no/wcag-standarden/333-forslag-ved-feil-niva-aa/118) |
| [Valideringsfeil i AGI og omsorgspenger](./e2e/uu-regresjoner.spec.tsx) | Felles kontroll med valideringsfeil, og fokus flyttes til første felt med feil. | Felles, [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116) |
| [Virksomhetslisten har navn](./e2e/uu-regresjoner.spec.tsx) (`@kjent-avvik`) | Den åpne listen i Aksel skal ha et tilgjengelig navn. Feiler som forventet. | [4.1.2](https://www.uutilsynet.no/wcag-standarden/412-navn-rolle-verdi-niva/121) |
| [Datoperioder i omsorgspenger](./e2e/uu-regresjoner.spec.tsx) (`@kjent-avvik`) | Datoperioden skal ikke gi vannrett rulling ved 320 piksler. Feiler som forventet. | [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144) |
| [Ekte nettleserzoom](./e2e/nettleserzoom.spec.tsx) (`uu-zoom`) | Full innsending av vanlig inntektsmelding ved 200 % og 400 % zoom. Synlig tekst sammenlignes med 100 %, og felles kontroll kjøres. | [1.4.4](https://www.uutilsynet.no/wcag-standarden/144-endring-av-tekststorrelse-niva-aa/96), [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144), felles |

CI lagrer separate rapporter som `playwright-report-e2e` og `playwright-report-uu`, med JSON-vedlegg fra axe og zoommålinger i UU-rapporten. Jobbene avbryter ikke hverandre ved feil.

Grønne tester er ikke en UU-godkjenning. Skjermleser, bilder av tekst, informasjon som bare formidles med farge, visuell klipping og axe-funn merket `incomplete` krever fortsatt manuell vurdering. Se [UU-sjekklisten](../../UNIVERSELL_UTFORMING.md).

## Nye tester

Legg tester i `tests/e2e/{feature}/` og mock-data i `tests/mocks/{feature}/`. Bruk rolle- og labelbaserte selektorer og [felles axe-kontroll](./e2e/uu.ts) for UU-tester.

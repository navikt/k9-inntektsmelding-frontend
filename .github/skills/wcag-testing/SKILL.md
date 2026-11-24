---
name: wcag-testing
description: Vurder WCAG-krav og skriv automatiserte UU-tester. Bruk ved spørsmål om universell utforming, etterlevelse, testdekning eller hvilke tilgjengelighetskrav som kan verifiseres med Playwright og axe. Skill testbare delkontroller fra manuell vurdering.
---

# WCAG og automatiserte UU-tester

Hjelp teamet å finne avvik og hindre regresjoner. En bestått test dokumenterer en delkontroll i et angitt omfang, ikke fullt samsvar med et WCAG-krav eller hele tjenesten.

## Start her

1. Les [UU-sjekklisten](../../../UNIVERSELL_UTFORMING.md) og avklar krav, flyt, tilstand og testmiljø.
2. Sjekk gjeldende fortolkning og testregel hos Uu-tilsynet. Bruk kravgrunnlaget for nettsteder i offentlig sektor, ikke unntak for native mobilapper. Skill lovkrav fra tilleggsmål som WCAG 2.2.
3. Les [testdokumentasjonen](../../../app/tests/README.md), [Playwright-oppsettet](../../../app/playwright.config.ts) og eksisterende tester før du lager nye.
4. Angi hva en test faktisk kan bekrefte, og hva som fortsatt trenger manuell vurdering. Ikke oppgi en prosentvis WCAG-dekning ut fra antall axe-regler eller grønne tester.

## Hva kan testes?

Tabellen viser eksempler på delkontroller, ikke en uttømmende kravliste.

| Krav | Egnet automatisk kontroll | Må fortsatt vurderes |
| --- | --- | --- |
| 1.1.1 Ikke-tekstlig innhold | Manglende tekstalternativ, tilgjengelig navn på ikonknapper og dekorative bilder skjult for hjelpemidler. | Om alternativet formidler riktig informasjon, og om bildet faktisk er dekorativt. |
| 1.3.1 og 1.3.2 Struktur og rekkefølge | Overskrifter, semantiske relasjoner, feltnavn, feltgrupper og konkrete forventninger til DOM-rekkefølge. | Meningsfylt struktur og leserekkefølge med skjermleser, også ved endret layout. |
| 1.3.4 Visningsretning | Vis sentrale sider i 360 × 640 og 640 × 360, sammenlign synlig tekst i `main`, kontroller vannrett rulling, let etter `@media (orientation)` i stilarkene og fang kall til `screen.orientation.lock`. | Rotasjon på ekte enheter. |
| 1.3.5 Inndataformål | Riktige `autocomplete`-verdier i relevante felt. | Om opplysningene gjelder den som fyller ut. Ikke behandle den ansattes opplysninger som kontaktpersonens. |
| 1.4.1 Bruk av farge | At feil har tekst, valgt steg har tekst eller programmatisk tilstand, og endringer viser feltnavn og verdier. | Om all nødvendig informasjon fortsatt kan forstås uten farge. Suppler med visuell kontroll. |
| 1.4.3 Tekstkontrast | Axe og måling av kjente, faktisk rendrede fargepar i relevante tilstander. | Bakgrunner som verktøyet ikke kan avgjøre, og dokumenterte unntak. |
| 1.4.11 Ikke-tekstlig kontrast | Felleskontrollen måler avgrensningen til felt, radioknapper og avkrysningsbokser, valgt radioknapp, bryter og ikoner i kontroller. Den måler også fokusmarkering for alle elementer som kan få fokus. Fokusmarkering finnes ved å sammenligne stilen før og etter `focus({ focusVisible: true, preventScroll: true })` på elementet, barna og tre nivåer opp, også `::before` og `::after`. Fokushendelsene stoppes i capture-fasen, slik at målingen ikke utløser validering i appen. | Tilstander som ikke finnes ved sjekkpunktene, for eksempel valgt kalenderdag. Grafikk uten tekst, hover og om lesefelt skal regnes som aktive. |
| 1.4.4 Tekststørrelse | Ekte 200 % nettleserzoom, bevart synlig tekst, feltverdier og gjennomførbare handlinger. | Visuell klipping og overlapp. Vannrett rulling alene er ikke automatisk et brudd på 1.4.4. |
| 1.4.5 Bilder av tekst | Kartlegging av bilder, SVG, canvas og bildebakgrunner kan støtte kontrollen. | Om bildet formidler tekst som skulle vært vanlig tekst, og om et unntak gjelder. |
| 1.4.10 Reflow | 320 CSS-piksler, ekte 400 % zoom fra 1280 piksler, dokumentoverløp, interne vannrette rulleområder og betjening. | Informasjonstap, overlapp og reelle behov for todimensjonal layout. Datopar og skjemafelt er ikke automatisk unntatt. |
| 1.4.12 Tekstavstand | Felleskontrollen legger på alle fire verdiene samtidig og ser etter tekst som klippes av `overflow: hidden` eller `clip`, og tekstlinjer som overlapper. Tekst som er klippet av en forelder, for eksempel i lukkede kort, telles ikke. Tekst i dialoger, popovere og elementer med `position` og `z-index` sammenlignes bare med tekst i samme lag. Ved funn legges et skjermbilde ved. | Om funnet faktisk gir tap av informasjon eller funksjon. Vannrett rulling er ikke tap etter dette kravet. Det vurderes under 1.4.10. |
| 1.4.13 Ekstra innhold | `sjekkInnholdVedPekerOgFokus` setter fokus på og holder pekeren over hvert element i `main` som kan få fokus, og rapporterer nytt innhold i `main` eller i et lag over siden (`role=tooltip`, `dialog`, `listbox`, `menu`, `popover`). Ikonknapper uten synlig tekst får 200 ms ventetid, fordi Aksels `Tooltip` åpnes etter 150 ms. Innhold som åpnes med klikk, og nettleserens `title`-verktøytips er unntatt. Får kontrollen funn, testes innholdet for seg: Escape lukker det, pekeren kan flyttes over det, og det blir stående. | Om innholdet kan avvises, pekes på og forblir tilgjengelig i den konkrete situasjonen, og innhold i dekoratøren. |
| 2.1.1, 2.1.2, 2.4.3, 2.4.7 og 3.2.1 Tastatur og fokus | Felleskontrollen tabber med ekte tastatur gjennom `main`, forover og bakover. Den starter og slutter ved midlertidige vaktknapper i `body`. Den kontrollerer at alle elementer som kan få fokus, blir nådd (en radiogruppe er ett stopp), at ingen har positiv `tabindex`, at rekkefølgen følger DOM og ikke hopper oppover, og at bakover gir samme rekkefølge snudd. Den kontrollerer også at fokus ikke låses, at `:focus-visible` og elementet er synlig, og at adresse og h1 ikke endres. Elementer med `cursor: pointer` som ikke kan få fokus, rapporteres som bare tilgjengelige med mus. Sjekkpunkter med åpen dialog hoppes over. Dialoger, kalendere og nedtrekkslister testes for seg med piltaster, Enter og Escape og retur av fokus. | Om rekkefølgen gir mening og om fokus havner riktig etter stegbytte, sletting og nye felt. Det krever skjermleser. Unntak for mus-elementer må ha et testet tastaturalternativ. |
| 2.1.4 Hurtigtaster med ett tegn | Fjern fokus fra skjemafelt, trykk a–z, 0–9 og vanlige tegn, og kontroller at adresse, innhold i `main`, fokus, dialoger og rulling er uendret. Søk etter `keydown` og `accessKey` i koden. | Hurtigtaster som bare virker i bestemte tilstander, og hurtigtaster i dekoratøren. |
| 2.2.2 og 2.3.1 Bevegelse og glimt | Les `document.getAnimations()` i `main` og rapporter animasjoner som går i det uendelige, varer over fem sekunder eller har mer enn tre runder per sekund. Finn `video` og `audio`. Axe dekker `marquee` og `blink`. | Innhold som oppdateres av seg selv uten CSS-animasjon, for eksempel med JavaScript eller polling, og om en lasteindikator er en del av aktiviteten. Mer enn tre runder per sekund er en indikasjon på glimt, ikke en måling av terskelverdien. |
| 2.4.2 Sidetitler | Én `<title>` og forventet tittel per rute ved hvert UU-sjekkpunkt, også etter navigering. Legg nye ruter inn i oversikten i felleskontrollene. Feilsider kontrolleres for seg. | Om tittelen beskriver sidens tema eller formål. Vurder ordlyden én gang før den legges inn som forventet tittel. |
| 3.1.1 og 3.1.2 Språk | `lang` på `<html>` og axe-reglene `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` og `valid-lang` på hele dokumentet. Den vanlige axe-skanningen dekker bare `main` og fanger ikke sidenivåregler. | Om sidespråket stemmer med innholdet, og om avsnitt på andre språk er merket. Egennavn og faguttrykk er unntatt. |
| 2.5.3 Ledetekst i navn | Felleskontrollen sammenligner synlig tekst (`innerText`) eller tekst fra `<label>` med navnet fra `ariaSnapshot()` for knapper, lenker og skjemafelt, etter normalisering. Axe `label-content-name-mismatch` dekker knapper og lenker med eget `aria-label`. Kontroller som bare vises i bestemte tilstander, for eksempel tredje refusjonsperiode, må hentes frem i en test. | Om stemmestyring faktisk treffer kontrollen. |
| 4.1.1 Parsing | Felleskontrollen finner like ID-er og vanlig feil nøsting i DOM-en, for eksempel blokkelementer i `p` og overskrifter, interaktive elementer i lenker og knapper og ugyldige barn av tabellrader. Ikke dupliser axe: `list`, `listitem`, `dlitem` og `definition-list` dekker lister og `dl`, og `nested-interactive` dekker knapper, men ikke lenker. Aksel-komponenter som lager en overskrift, for eksempel `ExpansionCard.Title`, kan bare inneholde `span`-elementer, så bruk `HStack as="span"`. | Ufullstendige elementer og dupliserte attributter. Valider rendrede sider med W3C-validatoren. Ikke send sider med persondata til eksterne tjenester. |
| 3.2.2 Inndata | `sjekkInndataUtenKontekstendring` endrer alle felt i `main`, også felt som dukker opp underveis, og kontrollerer adresse, h1, nye vinduer, dialoger og at fokus blir i feltet. Kontrollen endrer skjemaet og må kjøres i egne tester. Sett fokus før `selectOption`, fordi Playwright ikke gjør det selv. `useFieldArray().update()` gir raden ny `key`, slik at fokus forsvinner. Bruk `setValue` per felt. | Om endringer brukeren er varslet om på forhånd, er tydelige nok, og felt testene ikke når. |
| 3.2.3 og 3.2.4 Konsekvent navigering og identifikasjon | `sjekkKonsekventNavigering` husker lenker og knapper fra tidligere sjekkpunkter i samme test (`test.info().testId`). Elementer som går igjen, skal stå i samme relative rekkefølge, og lenker til samme adresse skal ha samme navn, eller et navn der det ene inneholder det andre. «Avbryt» og «Forrige steg» er unntatt fra navnekontrollen. Sammenligningen gjelder bare sjekkpunkter i samme test, så en flyt bør dekkes av én test fra start til kvittering. | Om knapper med samme funksjon har konsekvente navn på tvers av flyter, for eksempel «Neste steg» og «Bekreft og gå videre», og navigasjonen i dekoratøren. |
| 3.3.1 Identifikasjon av feil | Felleskontrollen krever at hver synlige `.aksel-error-message` er koblet til et felt med `aria-describedby`, og at feltet eller `fieldset` har `aria-invalid="true"`. Hvert felt som er merket ugyldig, må ha en synlig feilmelding. Utløs feil i alle flyter og kontroller at fokus flyttes til første felt med feil. `Controller` må sende `field.ref` til feltet, ellers kan ikke react-hook-form flytte fokus. | Hva skjermleseren leser opp, og om alle typer inndatafeil og feil fra serveren er dekket. |
| 3.3.3 Forslag ved feil | Felleskontrollen rapporterer felt med innhold som har en melding om manglende verdi, for eksempel «Må oppgis». Skriv ugyldige verdier, ikke bare tomme felt, i testene: datoer som «31.02.2024» og «abc», for lange tekster, tall utenfor grensene og ugyldige fødselsnumre. Aksels datovelger gir ingen dato når teksten ikke kan tolkes, så datokomponentene viser `UGYLDIG_DATO_FEILMELDING` når feltet har tekst uten dato. I datoperioder gjelder det også en til og med-dato før fra og med. Bruk `isBeforeFrom` fra `onValidate`. Kontroller at det brukeren skrev, blir stående. | Om meldingen gir nok informasjon til å rette feilen. En feiloppsummering er ikke påkrevd når fokus flyttes til feilen. |
| 4.1.3 Statusbeskjeder | Felleskontrollen overvåker DOM-en med en `MutationObserver` og rapporterer `.aksel-alert`, `.aksel-loader` og `.aksel-error-message` som er lagt til i `main` etter en handling fra brukeren på samme adresse, uten å ligge i `role="alert"`, `role="status"` eller `aria-live`. Aksels legacy `Alert` og `Loader` har ingen rolle. Gi systemfeil `role="alert"`. Valideringsfeil som ikke hører til ett felt, skal ikke avbryte brukeren. Bruk komponenten `Valideringsfeil`, som alltid har en `aria-live="polite"`-container. Øvrige varsler og lasteindikatorer får `role="status"`. | Hva skjermleseren faktisk leser opp, og varsler i tilstander testene ikke utløser. |
| 3.3.2 Ledetekster eller instruksjoner | Felleskontrollen krever at hvert synlige felt i `main` har en synlig `<label>` med tekst innenfor 80 piksler fra feltet. En beskrivelse i `aria-describedby` som står mellom ledetekst og felt, slik Aksel gjør, regnes med. Radiogrupper må ha et synlig spørsmål i `legend`. Hvert steg starter med [`AlleFeltMåFyllesUt`](../../../app/src/features/shared/components/AlleFeltMåFyllesUt.tsx), og kontrollen krever at setningen står før første felt. Bryteren for hjelpetekster regnes ikke som felt. | Om ledetekstene sier hva som skal fylles ut, og om alle felt faktisk er påkrevd. Valgfrie felt merkes med «(valgfritt)» i ledeteksten. Ikke bruk `hideLabel`, `hideLegend`, plassholdertekst eller `title` som eneste ledetekst. |
| 4.1.2 Navn, rolle, verdi | Tilgjengelig navn, ARIA-tilstand og semantikk for statusmeldinger. | Om navnene er forståelige, og hva skjermleseren faktisk kunngjør. |

For krav uten relevant automatisk kontroll: beskriv en konkret manuell test. Fravær av en automatisk test er ikke «Ikke relevant».

Når de automatiske testene består, men kravet også krever manuell kontroll, er status «Automatisk testet», ikke «Oppfylt». Legg den manuelle kontrollen i listen over gjenstående kontroller. Tastatur, skjermleser og visuelle vurderinger skal alltid gjøres manuelt før kravet kan settes til «Oppfylt».

## Skriv varige tester

- Gjenbruk flyter og mocker. Dekk de fire skjemaflytene, innsendte skjemaer og relevante betingede felt.
- Legg testene nær eksisterende tester og merk UU-tester med `@uu`. Bruk roller og feltnavn fremfor CSS-selektorer.
- Bruk [felleskontrollene](../../../app/tests/e2e/uu.ts) for axe, overskrifter og vannrett rulling. Ikke lag en parallell kopi.
- Åpne hjelpetekst, kalender, virksomhetsvalg og stegoversikt før skanning. Utløs valideringsfeil og serverfeil. Test lenker ved hover og faktisk tastaturfokus.
- Kontroller hvor dialoger og portaler rendres. En skanning av `main` omfatter ikke nødvendigvis en popup utenfor `main`.
- Test synlig resultat og tilgjengelig navn, beskrivelse eller tilstand. Ikke anta et bestemt ARIA-attributt uten å undersøke komponentens semantikk.
- Behold rapportens `incomplete`-funn for manuell vurdering. Ikke deaktiver regler eller skjul elementer for å få grønn kjøring.
- Kjør den minste relevante testen først, deretter UU-suiten når felles testoppsett endres. Endre ikke produksjonskode som del av en ren kontroll uten å avklare omfanget.

## Mål riktig

Tekstkontrast er minst 4,5:1 for vanlig tekst og 3:1 for stor tekst. Stor tekst er minst 18 pt, eller minst 14 pt i fet skrift; 1 pt er 96/72 CSS-piksler. Ikke rund opp en måling for å nå terskelen. Ta hensyn til gjennomskinnelighet og faktisk bakgrunn, ikke bare token-navn. Vurder unntak etter kravets fortolkning.

For 1.4.11 gjelder 3:1 for nødvendig visuell informasjon der kravet gjelder. Ikke krev dette av alle dekorative flater eller bruk tekstkontrastregelen ukritisk på komponentgrenser.

For 1.4.12: linjehøyde 1,5 ganger skriftstørrelsen, avsnittsavstand 2 ganger, bokstavavstand 0,12 ganger og ordavstand 0,16 ganger.

For reflow: dokumentbredde alene er ikke nok. Kontroller også interne rulleområder, skjult innhold og åpne kontroller. Native tekstfelt kan rulle innholdet sitt uten at hele siden trenger vannrett rulling. Vurder eventuelle todimensjonale unntak per innholdsdel, ikke for hele siden.

## Nettleserzoom

Gjenbruk [zoomtestene](../../../app/tests/e2e/nettleserzoom.spec.tsx). De bruker en lokal utvidelse i en isolert Chromium-profil og verifiserer nettleserens faktiske zoom og bredde.

- En smal viewport, CSS `zoom`, `deviceScaleFactor` eller pinch-zoom er ikke i seg selv ekte nettleserzoom.
- Hold utgangsbredden kjent. Verifiser zoom med nettleser-API og CDP, og sammenhold med `innerWidth` og pikselforhold.
- Behold funksjonelle handlinger ved forstørret visning. Bruk ekte tastaturhendelser hvis koordinatbaserte musehandlinger feiler i testverktøyet, ikke `force: true` eller DOM-klikk.
- Tekstsammenligning oppdager bortfalt tekst, men beviser ikke fravær av klipping eller overlapp. Visuelt skjult hjelpetekst skal heller ikke feilklassifiseres som klippet innhold.

## Kjente avvik og Aksel

Se [isolerte regresjonstester](../../../app/tests/e2e/uu-regresjoner.spec.tsx).

- Et dokumentert, avgrenset avvik kan ha en kjørende test med `@kjent-avvik` og `test.fail()`. Det er ikke en godkjenning eller en hoppet test.
- Gjør oppsett og øvrige kontroller før markeringen. Hvis tidligere kontroller bruker `expect.soft`, kontroller at `test.info().errors` er tom før `test.fail()`. Ellers kan nye feil bli skjult som forventede.
- Bare selve kravkontrollen skal være forventet feil. Når den består, skal «unexpected pass» kreve at markeringen vurderes og fjernes.
- Ikke patch Aksel eller legg inn DOM-hack. Skill egen layoutfeil fra bibliotekfeil, lag en gjentakbar beskrivelse og la teamet følge opp bibliotekfeilen.

## Kjøring og rapportering

Fra `app/`:

```bash
yarn test:uu
yarn exec playwright test --project=uu-smal
yarn check:types
yarn lint
```

UU og vanlige funksjonstester kjører parallelt i [Actions](../../workflows/verify-app.yml), med separate rapporter og uten å avbryte hverandre ved feil.

Oppsummer kort:

1. Krav og faktisk testede flyter, tilstander, bredder og zoomnivåer.
2. Eksakte kommandoer og resultat, med forventede feil adskilt fra beståtte tester.
3. Åpne avvik og konkrete manuelle kontroller som gjenstår.

Oppdater eksisterende dokumentasjon, ikke lag en ny rapportfil for hver kontroll. Behold ikke historikk om rettede feil i funnlisten. Bruk syntetiske testdata og ikke ta med personopplysninger i bevis.

Dekoratørens eget innhold er her en avtalt forutsetning, ikke et verifisert resultat. Integrasjon, innlogging, PDF-er og produksjon må ikke godkjennes ut fra lokale tester av hovedinnholdet.

## Kilder

- [Uu-tilsynets kravoversikt for offentlig sektor](https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86?f%5B0%5D=t2%3A129)
- [Uu-tilsynets testregler og fortolkninger](https://www.uutilsynet.no/regelverk/oversikt-over-testregler-nettsteder/709)
- [W3C om muligheter og begrensninger ved testverktøy](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
- [Playwrights tilgjengelighetstesting](https://playwright.dev/docs/accessibility-testing)

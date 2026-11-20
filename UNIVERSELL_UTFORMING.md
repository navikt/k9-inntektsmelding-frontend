# Sjekkliste for universell utforming

Dette dokumentet viser hva teamet må undersøke og dokumentere før vi kan konkludere om etterlevelse for inntektsmelding og refusjon for omsorgspenger.

Status 20. november 2026: UU-suiten kjører automatisk i CI ved normal bredde, 320 CSS-piksler og ekte nettleserzoom. To tester gjengir kjente avvik i datoperioder (1.4.10) og virksomhetsvalg (4.1.2) med forventet feil. Flere forhold må fortsatt undersøkes. Vi har ikke gjennomført en full kontroll eller kontrollert produksjon. Dokumentet er en arbeidsliste, ikke en tilgjengelighetserklæring eller godkjenning.

Teamet legger til grunn at dekoratørens eget innhold oppfyller UU-kravene. Dette er en forutsetning, ikke et verifisert testresultat. Integrasjonen med appen må fortsatt kontrolleres.

Kodegrunnlag ved opprettelse: `8fb32cf`.

## 1. Avklar ansvar og kravgrunnlag

- [ ] Utpek en ansvarlig for kontrollen, personer som skal teste, og hvem som godkjenner vurderingen.
- [ ] Registrer produksjonsadresse, miljø, commit og dato for hver kontroll.
- [ ] Bekreft hvilke nettsteder, skjemaer og eksterne tjenester vurderingen skal dekke.
- [ ] Avklar hvilken tilgjengelighetserklæring som dekker tjenesten. Ikke anta at en generell erklæring for Nav dekker alle skjemaene.
- [ ] Avklar eventuelle interne Nav-krav eller avtalekrav utover lovens minstekrav.

Utgangspunktet er Uu-tilsynets 48 minstekrav fra WCAG 2.1 for nettsteder i offentlig sektor. Dette er en webapplikasjon, selv om kildekoden ligger i en mappe som heter `app`. Unntakene for mobilapper skal derfor ikke brukes.

Alle 48 krav skal vurderes. Et krav kan være uten relevant innhold, for eksempel hvis tjenesten ikke har video. Registrer da begrunnelsen. Bruk tilsynets gjeldende tolkninger og testregler når dere avgjør samsvar. Tabellen nedenfor er en kort arbeidsoversikt, ikke en full gjengivelse av kravene og unntakene.

WCAG 2.2 kan brukes som et tilleggsmål. Ikke bland tilleggsmål med det bekreftede kravgrunnlaget for denne kontrollen.

## 2. Registrer resultatene slik

Bruk disse statusene per krav og testet flyt:

| Status | Betydning |
| --- | --- |
| Ikke vurdert | Vi mangler en ferdig vurdering. Enkelte observasjoner er ikke nok til å godkjenne kravet. |
| Oppfylt | Dokumenterte tester støtter at kravet er oppfylt i det angitte omfanget. |
| Avvik | Minst ett dokumentert brudd er funnet. |
| Ikke relevant | Kravet har ikke noe relevant innhold eller funksjonalitet i det undersøkte omfanget. Begrunnelse er registrert. |

Registrer dette for hvert resultat, enten i teamets saksverktøy eller i en testrapport:

| Opplysning | Hva vi må lagre |
| --- | --- |
| Krav og omfang | WCAG-nummer, flyt, URL, steg, komponent og tilstand. |
| Testmiljø | Commit eller deploy-versjon, dato, nettleser, operativsystem, hjelpemiddel og versjoner. |
| Testoppsett | Skjermbredde, zoom, tekstinnstillinger og relevante testdata uten personopplysninger. |
| Fremgangsmåte | Trinn som lar en annen person gjenta testen. |
| Resultat | Forventet og faktisk oppførsel, status og begrunnelse. |
| Bevis | Skjermbilde, måling, tilgjengelighetstre eller beskrivelse av skjermleserens kunngjøring. |
| Oppfølging | Ansvarlig, sak, prioritet, frist og resultat av ny test etter retting. |

Ikke lagre reelle fødselsnumre, innloggingsopplysninger eller andre personopplysninger i rapporter, skjermbilder eller testlogger.

## 3. Følg opp de kjente funnene først

Observasjonene under stammer fra den avgrensede lokale kontrollen 18. november 2026. Vi brukte Chromium, mockede API-svar og visningsbredder på 1280 og 320 CSS-piksler. Testen dekket de to første stegene i vanlig inntektsmelding, inkludert endring av månedsinntekt. Dekoratøren fra Express-serveren var ikke med.

### F03: Fokus havner på dokumentets body ved stegbytte

**Må undersøkes mot 2.4.3 Fokusrekkefølge.**

Etter overgangen fra «Dine opplysninger» til «Inntekt og refusjon» var `document.activeElement` lik `BODY`. Sidetittelen ble oppdatert. Vi har ikke verifisert hvordan en faktisk skjermleser oppfatter overgangen. Observasjonen alene er ikke et bekreftet WCAG-brudd.

- [ ] Gjenta overgangen med bare tastatur og med skjermleser.
- [ ] Kontroller hva som får fokus, hva som kunngjøres, og hvor neste Tab-trykk fører.
- [ ] Test fremover, bakover, endringslenker fra oppsummeringen og overgang til kvittering.
- [ ] Vurder om [useScrollToTopOnMount](./app/src/features/shared/hooks/useScrollToTopOnMount.tsx) må suppleres med fokusstyring. Rulling alene flytter ikke tastaturfokus.

### F04: Kontrollen og tilgjengelighetserklæringen er ikke verifisert

**Mangler i kunnskapsgrunnlaget, ikke dokumentasjon på at erklæringen mangler.**

Det undersøkte testoppsettet dokumenterer ikke en full UU-kontroll. Det finnes en avgrenset tastaturtest for virksomhetsvalg, men den dekker ikke hele tjenesten.

- [ ] Finn tidligere UU-rapporter, testresultater og åpne saker hos teamet.
- [ ] Finn gjeldende tilgjengelighetserklæring og kontroller innhold, omfang og dato.
- [ ] Avklar hvem som følger opp feil i dekoratøren, innloggingen og andre fellesløsninger.

## 4. Dekk alle flyter og relevante tilstander

Bruk [rutene](./app/src/routes/) som utgangspunkt. Alle adresser nedenfor har prefikset `/k9-im-dialog`. Plassholdere som `$id` må erstattes med verdier fra testmiljøet.

| Flyt | Sider og handlinger som skal inngå |
| --- | --- |
| Vanlig inntektsmelding, `/$id/*` | Dine opplysninger, inntekt og refusjon, oppsummering, innsending, kvittering og visning av tidligere innsending. Ta med korrigering av tidligere inntektsmelding. |
| Arbeidsgiverinitiert inngang, `/opprett` | Valg av registreringsgrunnlag, virksomhetsvalg, personoppslag og henting av opplysninger. |
| Arbeidsgiverinitiert for nyansatt, `/agi/$id/*` | Dine opplysninger, refusjon, oppsummering, innsending, kvittering og visning. |
| Arbeidsgiverinitiert unntatt Aa-registeret, `/agi-unntatt-aaregister/$id/*` | Dine opplysninger, inntekt og refusjon, oppsummering, innsending, kvittering og visning. Ta med ytelsesavhengige fraværsfelt. |
| Refusjon for omsorgspenger, `/refusjon-omsorgspenger/$organisasjonsnummer/*` | Intro, ansatt og arbeidsgiver, omsorgsdager, refusjon, oppsummering, kvittering og visning via `/$id`. |
| Felles sider og integrasjoner | Dekoratør, innlogging, virksomhetsbytte, hjelpetekster, avbryt, utgått oppgave, manglende tilgang, generell feilside og ukjent adresse. |

For hver flyt:

- [ ] Fullfør en gyldig innsending med bare tastatur.
- [ ] Fullfør flyten med skjermleser, inkludert oppsummering og bekreftet innsending.
- [ ] Utløs tomme obligatoriske felt, ugyldige datoer, ugyldige beløp og feil i personoppslag.
- [ ] Test feilmeldinger fra server, nettverksbrudd, ventetid og muligheten til å prøve igjen.
- [ ] Kontroller både automatisk feilfokus og feil som settes etter asynkrone oppslag.
- [ ] Åpne og lukk hjelpetekster, kalendere, virksomhetsvalg og fremgangsindikator.
- [ ] Legg til og slett gjentakende felt, som perioder, enkeltdager, refusjonsendringer og naturalytelser. Kontroller fokus etter sletting.
- [ ] Test relevante ja/nei-valg, betingede felt og ytelsesvarianter som endrer innhold eller validering.
- [ ] Gå frem og tilbake og bruk endringslenkene fra oppsummeringen. Kontroller at verdier beholdes og kan korrigeres.
- [ ] Test direkte inngang, oppdatering av siden og nettleserens tilbakeknapp.
- [ ] Test utløpt innlogging og utloggingsvarsel. Kontroller varsling, eventuell forlengelse og hva som skjer med utfylte data.

Delte komponenter kan testes samlet, men må også kontrolleres i sidene og tilstandene der de brukes. En godkjent komponent betyr ikke at hele siden er tilgjengelig.

## 5. Bruk flere testmetoder

Dette er anbefalt testdekning for teamet, ikke en lovbestemt liste over nettlesere eller enheter. Begrunn utvalget og registrer faktisk testede versjoner.

| Metode | Hva vi skal gjøre |
| --- | --- |
| Automatisk skanning | Kjør `yarn test:uu` fra `app/`. Axe skanner hovedinnholdet i fire skjemaflyter og utvalgte dynamiske tilstander. Vurder også rapportenes `incomplete`-funn manuelt. |
| Tastatur | Bruk Tab, Shift+Tab, Enter, Space, piltaster og Escape der kontrollene støtter dem. Se etter tastaturfeller, uventet fokus og manglende synlig fokus. |
| Skjermleser | Test representative hele flyter med NVDA i en støttet Windows-nettleser og VoiceOver med Safari på macOS eller iOS. Bruk både lesemodus og skjemabetjening. |
| Tale og berøring | Kontroller at synlige feltnavn kan brukes ved stemmestyring, og at handlinger ikke krever sammensatte gester eller presis timing. |
| Nettlesere | Kontroller produksjonsbygget i støttede nettlesere. Ta med Chromium og Safari/WebKit, og Firefox hvis den inngår i støtten. |
| Smale og brede visninger | Test 320, 375, 768, 1280 og 1920 CSS-piksler der det gir relevant dekning. Kontroller også stående og liggende mobilvisning. |
| Forstørring | Test tekst ved 200 % og reflow ved 400 % zoom fra 1280 piksler. Kontroller åpne felter, feilmeldinger og dialoger, ikke bare startvisningen. |
| Tekstavstand | Overstyr linjehøyde til 1,5 ganger skriftstørrelsen, avsnittsavstand til 2 ganger, bokstavavstand til 0,12 ganger og ordavstand til 0,16 ganger. Kontroller tap av innhold og funksjon. |
| Kontrast | Mål faktiske fargepar for tekst, kontroller og tilstander. Aksel-tokens alene beviser ikke riktig kontrast i den valgte kombinasjonen. |
| Produksjonslik integrasjon | Test med dekoratør, innlogging, feilsider og reelle responstider i godkjent testmiljø. Bruk bare testdata. |

Appens [Playwright-oppsett](./app/playwright.config.ts) kjører Chromium og starter Vite lokalt. Det er ikke tilstrekkelig for å verifisere produksjonens dekoratør, innlogging eller skjermleseroppførsel. [Serveren](./server/src/frontendRoute.ts) legger til dekoratøren.

Eksisterende kommandoer fra `app/`:

```bash
yarn test:e2e
yarn test:uu
yarn test:e2e -- tests/e2e/inntektsmelding/
yarn test:e2e -- tests/e2e/arbeidsgiverinitiert/
yarn test:e2e -- tests/e2e/refusjon-omsorgspenger/
yarn check:types
yarn lint
```

Testene merket `@uu` kjører i en egen suite og CI-jobb, parallelt med funksjonstestene. De dekker alle fire skjemaflyter og visning av innsendte skjemaer ved normal og smal bredde. Vanlig inntektsmelding testes også ved ekte 200 % og 400 % nettleserzoom. Kontrollene bruker WCAG 2.1 A/AA-tagger uten deaktiverte regler. To isolerte tester har forventet feil for de kjente avvikene; nye axe-avvik skal fortsatt feile ordinært. JSON-rapporter med funn og forhold som krever manuell vurdering lagres per steg. Se [testdokumentasjonen](./app/tests/README.md) for dekning og rapporter.

Skanningene er avgrenset til `main`. De dekker ikke hele dokumentet, dekoratøren, innloggingen, alle varianter eller faktiske mobilnettlesere. Beståtte axe-tester, funksjonstester, typekontroll og lint er ikke en UU-godkjenning.

### Tekstkontrast (1.4.3)

Målt lokalt 20. november 2026 i Chromium ved 1280 × 720, med mockede API-svar. Kontrollen dekker alle fire flyter, visning av innsendte skjemaer, valideringsfeil, serverfeil, åpne hjelpetekster, kalender og virksomhetsvalg, samt lenker ved hover og tastaturfokus. Ti faste UU-tester og to målrettede kontrasttester besto.

| Tekst | Tekstfarge / bakgrunn | Kontrast |
| --- | --- | --- |
| Knappetekst, laveste målte verdi | `#ffffff` / `#2176d4` | 4,56:1 |
| Lenker, laveste målte verdi | `#005bb6` / `#ffffff` | 6,62:1 |
| Dempet hjelpetekst | `#49515e` / `#ffffff` | 8,01:1 |
| Knapp for hjelpetekst under musepekeren | `#005bb6` / `#e1e3e7` | 5,15:1 |
| Feilmelding på grå flate | `#bc002a` / `#f5f6f7` | 6,12:1 |
| Overskriftene som krevde manuell kontroll | `#202733` / `#ffffff` | 15,01:1 |

Fargene er hentet fra rendret CSS, med gjennomskinnelige bakgrunner lagt sammen før beregning av WCAG-kontrast. Tersklene er brukt på uavrundede verdier: 4,5:1 for vanlig tekst og 3:1 for tekst på minst 18 pt (24 CSS-piksler), eller 14 pt i fet skrift. Dempet og gjennomstreket tekst er ikke unntatt. Ingen kontrastunntak var nødvendige for teksten som ble målt. Bakgrunnene axe ikke kunne avgjøre, er kontrollert visuelt og målt, også med kalenderen lukket.

### Testgrunnlag og gjenstående kontroll for 1.3.1

Ti UU-tester med 35 axe-skanninger og 27 målrettede valideringstester besto 20. november 2026. UU-testene kontrollerer også overskriftshierarki, navngitte seksjoner, gjentakende feltgrupper og kobling mellom kontaktfelt og feilmeldinger. Skjermbilder fra de berørte sidene er kontrollert ved 1280 × 720 CSS-piksler.

Ingen egne HTML-tabeller ble funnet i app-koden eller de undersøkte tilstandene. Månedsinntektene vises som fortløpende måned–beløp-par i et CSS-grid.

- [ ] Bekreft overskriftsnavigasjon og navngitte feltgrupper med skjermleser, inkludert flere rader og sletting.
- [ ] Kontroller leserekkefølgen for månedsinntekter og sammenhengen mellom måned og beløp med skjermleser.
- [ ] Dekk øvrige ytelsesvarianter, serverfeil og mobilvisning. PDF-innhold er ikke vurdert.

## 6. Vurder alle 48 WCAG-krav

Status gjelder vurderingen av tjenesten som helhet. «Ikke vurdert» inkluderer krav der vi bare har gjort stikkprøver. Kolonnen «Kort fortalt» gjengir Uu-tilsynets oppsummering. Lenken i kravkolonnen går til den enkelte kilden.

### Mulig å oppfatte

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [1.1.1](https://www.uutilsynet.no/wcag-standarden/111-ikke-tekstlig-innhold-niva/87) Ikke-tekstlig innhold (A) | Gi brukeren et tekstalternativ for innhold som ikke er tekst. | Oppfylt (appens eget innhold) |
| [1.2.1](https://www.uutilsynet.no/wcag-standarden/121-bare-lyd-og-bare-video-forhandsinnspilt-niva/88) Bare lyd og bare video, forhåndsinnspilt (A) | Gi brukeren et alternativ når innholdet presenteres kun som lydklipp, eller kun video (uten lyd). | Oppfylt |
| [1.2.2](https://www.uutilsynet.no/wcag-standarden/122-teksting-forhandsinnspilt-niva/89) Teksting, forhåndsinnspilt (A) | Tilby teksting for forhåndsinnspilt video med lyd. | Oppfylt |
| [1.2.5](https://www.uutilsynet.no/wcag-standarden/125-synstolking-forhandsinnspilt-niva-aa/842) Synstolking, forhåndsinnspilt (AA) | Tilby synstolking av forhåndsinnspilte videoer, publisert 1. februar 2024 eller senere. Synstolking er at viktig visuell informasjon i video blir beskrevet via lyd. Kravet gjelder bare for offentlige virksomheter. | Oppfylt |
| [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90) Informasjon og relasjoner (A) | Ting skal være kodet som det ser ut som. For eksempel skal en overskrift være kodet som en overskrift. | Ikke vurdert |
| [1.3.2](https://www.uutilsynet.no/wcag-standarden/132-meningsfylt-rekkefolge-niva/91) Meningsfylt rekkefølge (A) | Presenter innhold i en meningsfull rekkefølge. | Ikke vurdert |
| [1.3.3](https://www.uutilsynet.no/wcag-standarden/133-sensoriske-egenskaper-niva/92) Sensoriske egenskaper (A) | Instruksjoner må ikke utelukkende være avhengige av form, størrelse, visuell plassering, orientering, eller lyd for å kunne bli forstått. | Ikke vurdert |
| [1.3.4](https://www.uutilsynet.no/wcag-standarden/134-visningsretning-niva-aa/141) Visningsretning (AA) | Brukeren må få velge om innholdet skal vises i liggende eller stående retning. | Ikke vurdert |
| [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) Identifiser formål med inndata (AA) | Skjemaelementer er kodet med inndataformål. | Oppfylt |
| [1.4.1](https://www.uutilsynet.no/wcag-standarden/141-bruk-av-farge-niva/93) Bruk av farge (A) | Ikke bruk presentasjon som bygger utelukkende på farge. | Oppfylt (appens eget innhold) |
| [1.4.2](https://www.uutilsynet.no/wcag-standarden/142-styring-av-lyd-niva/94) Styring av lyd (A) | Gi brukeren mulighet til å stoppe eller pause lyd som starter automatisk. | Oppfylt |
| [1.4.3](https://www.uutilsynet.no/wcag-standarden/143-kontrast-minimum-niva-aa/95) Kontrast, minimum (AA) | Kontrastforholdet mellom teksten og bakgrunnen er minst 4,5:1. | Oppfylt (appens eget innhold) |
| [1.4.4](https://www.uutilsynet.no/wcag-standarden/144-endring-av-tekststorrelse-niva-aa/96) Endring av tekststørrelse (AA) | Tekst kan bli endret til 200 % størrelse uten tap av innhold eller funksjon. | Oppfylt (appens eget innhold) |
| [1.4.5](https://www.uutilsynet.no/wcag-standarden/145-bilder-av-tekst-niva-aa/97) Bilder av tekst (AA) | Bruk tekst i stedet for bilder av tekst. | Oppfylt (appens eget innhold) |
| [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144) Dynamisk tilpasning, reflow (AA) | Innhold skal kunne endres til 400 % størrelse ved 1280 piksler bredde, uten tap av informasjon eller funksjonalitet. | Avvik |
| [1.4.11](https://www.uutilsynet.no/wcag-standarden/1411-kontrast-ikke-tekstlig-innhold-niva-aa/145) Kontrast for ikke-tekstlig innhold (AA) | Ikke-tekstlig innhold skal ha et kontrastforhold på minst 3:1 mot farge(r) som ligger ved siden av. | Ikke vurdert |
| [1.4.12](https://www.uutilsynet.no/wcag-standarden/1412-tekstavstand-niva-aa/146) Tekstavstand (AA) | Tekstavstanden skal kunne overstyres for å gjøre teksten lettere å lese. | Ikke vurdert |
| [1.4.13](https://www.uutilsynet.no/wcag-standarden/1413-pekerfolsomt-innhold-eller-innhold-ved-tastaturfokus-niva-aa/147) Pekerfølsomt innhold eller innhold ved tastaturfokus (AA) | Brukeren skal ha mer kontroll over innholdet på nettsiden som får fokus med musepeker eller tastatur. | Ikke vurdert |

### Mulig å betjene

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98) Tastatur (A) | All funksjonalitet skal kunne brukes kun ved hjelp av tastatur. | Ikke vurdert |
| [2.1.2](https://www.uutilsynet.no/wcag-standarden/212-ingen-tastaturfelle-niva/99) Ingen tastaturfelle (A) | Unngå tastaturfeller. | Ikke vurdert |
| [2.1.4](https://www.uutilsynet.no/wcag-standarden/214-hurtigtaster-som-bestar-av-ett-tegn-niva/782) Hurtigtaster som består av ett tegn (A) | Brukeren skal enkelt kunne slå av hurtigtaster som består av ett tegn. | Ikke vurdert |
| [2.2.1](https://www.uutilsynet.no/wcag-standarden/221-justerbar-hastighet-niva/100) Justerbar hastighet (A) | Tidsbegrensninger skal kunne justeres av brukeren. | Ikke vurdert |
| [2.2.2](https://www.uutilsynet.no/wcag-standarden/222-pause-stopp-skjul-niva/101) Pause, stopp, skjul (A) | Gi brukeren mulighet til å stoppe, pause eller skjule innhold som automatisk endrer seg. | Ikke vurdert |
| [2.3.1](https://www.uutilsynet.no/wcag-standarden/231-terskelverdi-pa-maksimalt-tre-glimt-niva/102) Terskelverdi på maksimalt tre glimt (A) | Innhold skal ikke blinke mer enn tre ganger per sekund. | Ikke vurdert |
| [2.4.1](https://www.uutilsynet.no/wcag-standarden/241-hoppe-over-blokker-niva/103) Hoppe over blokker (A) | Gi brukeren mulighet til å hoppe direkte til hovedinnholdet. | Ikke vurdert |
| [2.4.2](https://www.uutilsynet.no/wcag-standarden/242-sidetitler-niva/104) Sidetitler (A) | Bruk nyttige og tydelige sidetitler. | Oppfylt (appens eget innhold) |
| [2.4.3](https://www.uutilsynet.no/wcag-standarden/243-fokusrekkefolge-niva/105) Fokusrekkefølge (A) | Presenter innholdet i en logisk rekkefølge. | Ikke vurdert |
| [2.4.4](https://www.uutilsynet.no/wcag-standarden/244-formal-med-lenke-i-kontekst-niva/106) Formål med lenke, i kontekst (A) | Alle lenkers mål og funksjon fremgår tydelig av lenketeksten. | Ikke vurdert |
| [2.4.5](https://www.uutilsynet.no/wcag-standarden/245-flere-mater-niva-aa/107) Flere måter (AA) | Tilby brukeren flere måter å navigere på. | Ikke vurdert |
| [2.4.6](https://www.uutilsynet.no/wcag-standarden/246-overskrifter-og-ledetekster-niva-aa/108) Overskrifter og ledetekster (AA) | Sørg for at ledetekster og overskrifter er beskrivende. | Ikke vurdert |
| [2.4.7](https://www.uutilsynet.no/wcag-standarden/247-synlig-fokus-niva-aa/109) Synlig fokus (AA) | Sørg for at alt innhold får synlig fokus når du navigerer med tastatur. | Ikke vurdert |
| [2.5.1](https://www.uutilsynet.no/wcag-standarden/251-pekerbevegelser-niva/148) Pekerbevegelser (A) | Innhold på nettsiden skal kunne brukes med enkel pekerinput. | Ikke vurdert |
| [2.5.2](https://www.uutilsynet.no/wcag-standarden/252-pekeravbrytelse-niva/149) Pekeravbrytelse (A) | Uheldige og feilaktige input via mus eller berøringsskjerm skal lettere kunne forhindres. | Ikke vurdert |
| [2.5.3](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150) Ledetekst i navn (A) | Brukere som bruker visuelle ledetekster skal også kunne bruke kodede ledetekster. | Ikke vurdert |
| [2.5.4](https://www.uutilsynet.no/wcag-standarden/254-bevegelsesaktivering-niva/151) Bevegelsesaktivering (A) | Funksjonalitet som kan betjenes med å bevege enheten eller ved brukerbevegelse, skal også kunne betjenes med brukergrensesnittkomponenter. | Ikke vurdert |

### Forståelig

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [3.1.1](https://www.uutilsynet.no/wcag-standarden/311-sprak-pa-siden-niva/110) Språk på siden (A) | Sørg for at språket til innholdet på alle nettsider er angitt i koden. | Ikke vurdert |
| [3.1.2](https://www.uutilsynet.no/wcag-standarden/312-sprak-pa-deler-av-innhold-niva-aa/111) Språk på deler av innhold (AA) | Sørg for at alle deler av innholdet som er på et annet språk enn resten av siden er markert i koden. | Ikke vurdert |
| [3.2.1](https://www.uutilsynet.no/wcag-standarden/321-fokus-niva/112) Fokus (A) | Når en komponent kommer i fokus medfører dette ikke automatisk betydelige endringer i siden. | Ikke vurdert |
| [3.2.2](https://www.uutilsynet.no/wcag-standarden/322-inndata-niva/114) Inndata (A) | Endring av verdien til et skjemafelt medfører ikke automatisk betydelige endringer i siden. | Ikke vurdert |
| [3.2.3](https://www.uutilsynet.no/wcag-standarden/323-konsekvent-navigering-niva-aa/113) Konsekvent navigering (AA) | Navigasjonslenker som gjentas på flere sider skal ha en konsekvent rekkefølge. | Ikke vurdert |
| [3.2.4](https://www.uutilsynet.no/wcag-standarden/324-konsekvent-identifikasjon-niva-aa/115) Konsekvent identifikasjon (AA) | Elementer som har samme funksjonalitet på tvers av flere sider er utformet likt. | Ikke vurdert |
| [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116) Identifikasjon av feil (A) | For feil som oppdages automatisk må du vise hvor feilen har oppstått og gi en tekstbeskrivelse av feilen. | Ikke vurdert |
| [3.3.2](https://www.uutilsynet.no/wcag-standarden/332-ledetekster-eller-instruksjoner-niva/117) Ledetekster eller instruksjoner (A) | Det vises ledetekster eller instruksjoner når du har skjemaelementer som må fylles ut. | Ikke vurdert |
| [3.3.3](https://www.uutilsynet.no/wcag-standarden/333-forslag-ved-feil-niva-aa/118) Forslag ved feil (AA) | Dersom feil blir oppdaget automatisk, gi brukeren et forslag til hvordan feilen kan rettes. | Ikke vurdert |
| [3.3.4](https://www.uutilsynet.no/wcag-standarden/334-forhindring-av-feil-juridiske-feil-okonomiske-feil-datafeil-niva-aa/119) Forhindring av juridiske feil, økonomiske feil og datafeil (AA) | For sider som medfører juridiske forpliktelser må det være mulig å kunne angre, kontrollere eller bekrefte dataene som sendes inn. | Ikke vurdert |

### Robust

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [4.1.1](https://www.uutilsynet.no/wcag-standarden/411-parsing-oppdeling-niva/120) Parsing, oppdeling (A) | Alle sider skal være uten store kodefeil. | Ikke vurdert |
| [4.1.2](https://www.uutilsynet.no/wcag-standarden/412-navn-rolle-verdi-niva/121) Navn, rolle, verdi (A) | Alle komponenter har navn og rolle bestemt i koden. | Avvik |
| [4.1.3](https://www.uutilsynet.no/wcag-standarden/413-statusbeskjeder-niva-aa/152) Statusbeskjeder (AA) | Brukeren skal få statusbeskjeder om viktige endringer på nettsiden uten at det gir kontekstendring. | Ikke vurdert |

### Dokumenterte bevis og avvik

- 1.1.1, 1.4.1, 1.4.3 og 1.4.5 er vurdert for appens eget innhold. Dekoratøren er forutsatt uten avvik. PDF-innhold er ikke vurdert.
- 1.3.5: Kontaktfeltet har `autocomplete="name"` eller `"tel"` i alle fire flyter. Opplysninger om den ansatte omfattes ikke.
- 1.4.3: Tekst, lenker, hjelpetekst og feil er målt i alle fire flyter. Ingen kontrastavvik ble funnet. Se seksjon 5.
- 1.4.4: Alle fire flyter er kontrollert med 200 % nettleserzoom fra 1920 piksler bredde. Den permanente zoomtesten dekker vanlig inntektsmelding.
- 1.4.10: Ved 320 CSS-piksler og 400 % zoom gir datoperioder i «Omsorgsdager» 64 piksler vannrett overløp. [DateRangePickerWrapped](./app/src/features/shared/react-hook-form-wrappers/DateRangePickerWrapped.tsx) tvinger feltene ved siden av hverandre, selv om layouten ikke krever to dimensjoner.
- 2.4.2: Alle steg, innsendte skjemaer og feilsider har en tittel som sier hva siden gjelder, og hvilken ytelse eller søknad den hører til. UU-testene kontrollerer forventet tittel ved hvert sjekkpunkt. Det fanger også en gammel tittel som blir stående etter navigering. Under lasting står tittelen fra forrige side eller «Inntektsmelding».
- 4.1.2: Åpen `UNSAFE_Combobox` fra Aksel 8.16.2 mangler tilgjengelig navn på `role="listbox"`. Axe rapporterer `aria-input-field-name`. Feilen skal følges opp med Aksel.
- 1.3.1: Automatiske strukturkontroller består, men skjermleserkontroll og øvrig testomfang gjenstår. Se seksjon 5.

## 7. Kontroller tilgjengelighetserklæring og tilbakemelding

- [ ] Bekreft at riktig erklæring er opprettet og publisert gjennom uustatus.no.
- [ ] Kontroller at erklæringen dekker riktig tjeneste og adresse, og at den bygger på oppdaterte tester.
- [ ] Kontroller at publisert lenke fører til riktig erklæring og er enkel å finne fra tjenesten. Undersøk særlig dekoratørens bunntekst. At en generell lenke finnes, beviser ikke riktig dekning.
- [ ] Følg tilsynets anbefaling om at erklæringen også kan finnes uten innlogging.
- [ ] Registrer brudd, konsekvenser for brukeren og tilgjengelige alternativer. Begrunn eventuelle unntak særskilt; ikke registrer unntatt innhold som bestått.
- [ ] Kontroller en tilgjengelig kanal for tilbakemeldinger, med navngitt ansvar hos teamet eller riktig fellesfunksjon.
- [ ] Test at en bruker kan melde et UU-problem og be om tilgjengelig informasjon. Ikke bruk sensitive testopplysninger i henvendelsen.
- [ ] Kontroller informasjon om klagemulighet i erklæringen.
- [ ] Avtal oppdatering minst én gang i året, etter større endringer og når samsvarsstatus endres.

## 8. Avslutt kontrollen og planlegg vedlikehold

- [ ] Alle 48 krav har et dokumentert resultat eller en begrunnet vurdering av at kravet ikke er relevant.
- [ ] Valgte sider, hele prosesser og dynamiske tilstander er testet. Begrensninger og utelatte deler er oppgitt.
- [ ] Automatisk skanning er supplert med manuell kontroll, tastatur og skjermleser.
- [ ] Kjente avvik har ansvarlig, prioritet, frist og eventuell tilgjengelig alternativ fremgangsmåte.
- [ ] Rettede avvik er testet på nytt i berørte flyter. Tester av felleskomponenter dekker relevante brukssteder.
- [ ] Produksjonslik kontroll med dekoratør og innlogging er gjennomført, og avvik fra lokal testing er fulgt opp.
- [ ] Ansvarlig har godkjent konklusjonen og oppdatert tilgjengelighetserklæringen. Gjenstående avvik fremgår av konklusjonen.
- [ ] Avtal ny kontroll ved endring i skjemaer, validering, routing, felleskomponenter, Aksel eller dekoratøren.
- [ ] Legg egnede regresjonstester i CI og avtal manuell kontroll av det automatiseringen ikke dekker.

Fullt samsvar kan ikke konkluderes så lenge relevante krav har avvik eller ikke er vurdert. En korrekt erklæring om delvis samsvar gjør ikke de tekniske avvikene til oppfylte krav.

## Kilder

Kravgrunnlag og veiledning kontrollert 18. november 2026. Sjekk gjeldende versjoner før dere avslutter vurderingen.

- [Uu-tilsynets 48 WCAG-krav for offentlig sektor](https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86?f%5B0%5D=t2%3A129)
- [EUs webdirektiv og kravene i norsk rett](https://www.uutilsynet.no/webdirektivet-wad/eus-webdirektiv-wad/265)
- [Tilsynets testregler for nettsteder](https://www.uutilsynet.no/regelverk/oversikt-over-testregler-nettsteder/709)
- [Hvordan lage og oppdatere tilgjengelighetserklæringen](https://www.uutilsynet.no/tilgjengelighetserklaering/korleis-lage-og-oppdatere-tilgjengelegheitserklaering/1131)
- [2.5.3 Ledetekst i navn](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150)
- [1.4.10 Dynamisk tilpasning](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144)

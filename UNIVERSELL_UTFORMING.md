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
| Automatisk testet | Automatiske tester består, men kravet krever også manuell kontroll, for eksempel med tastatur, skjermleser eller visuell vurdering. Kravet er ikke godkjent før den manuelle kontrollen er gjort. |
| Oppfylt | Dokumenterte tester støtter at kravet er oppfylt i det angitte omfanget. Krav som må kontrolleres manuelt, settes ikke til «Oppfylt» før den manuelle kontrollen er gjort. |
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

**Rettet.** Etter overgangen fra «Dine opplysninger» til «Inntekt og refusjon» var `document.activeElement` lik `BODY`. Knappen brukeren aktiverte, forsvant med det gamle steget, så neste Tab startet øverst på siden, i dekoratøren. Nå flytter [useStartPåNyttSteg](./app/src/features/shared/hooks/useStartPåNyttSteg.tsx) fokus til h2-overskriften for det nye steget. Ved første visning, før brukeren har gjort noe, blir fokus stående øverst, slik at «Hopp til hovedinnhold» er første stopp. Testen «Fokus flyttes til overskriften ved stegbytte» går fremover og bakover med tastatur i inntektsmelding og omsorgspenger.

- [ ] Kontroller med skjermleser at overskriften leses opp ved stegbytte, også fra endringslenkene på oppsummeringen og ved overgang til kvittering.

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

Status gjelder vurderingen av tjenesten som helhet. «Ikke vurdert» inkluderer krav der vi bare har gjort stikkprøver. «Automatisk testet» betyr at manuell kontroll gjenstår, se listen under tabellene. Kolonnen «Kort fortalt» gjengir Uu-tilsynets oppsummering. Lenken i kravkolonnen går til den enkelte kilden.

### Mulig å oppfatte

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [1.1.1](https://www.uutilsynet.no/wcag-standarden/111-ikke-tekstlig-innhold-niva/87) Ikke-tekstlig innhold (A) | Gi brukeren et tekstalternativ for innhold som ikke er tekst. | Automatisk testet |
| [1.2.1](https://www.uutilsynet.no/wcag-standarden/121-bare-lyd-og-bare-video-forhandsinnspilt-niva/88) Bare lyd og bare video, forhåndsinnspilt (A) | Gi brukeren et alternativ når innholdet presenteres kun som lydklipp, eller kun video (uten lyd). | Oppfylt |
| [1.2.2](https://www.uutilsynet.no/wcag-standarden/122-teksting-forhandsinnspilt-niva/89) Teksting, forhåndsinnspilt (A) | Tilby teksting for forhåndsinnspilt video med lyd. | Oppfylt |
| [1.2.5](https://www.uutilsynet.no/wcag-standarden/125-synstolking-forhandsinnspilt-niva-aa/842) Synstolking, forhåndsinnspilt (AA) | Tilby synstolking av forhåndsinnspilte videoer, publisert 1. februar 2024 eller senere. Synstolking er at viktig visuell informasjon i video blir beskrevet via lyd. Kravet gjelder bare for offentlige virksomheter. | Oppfylt |
| [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90) Informasjon og relasjoner (A) | Ting skal være kodet som det ser ut som. For eksempel skal en overskrift være kodet som en overskrift. | Oppfylt |
| [1.3.2](https://www.uutilsynet.no/wcag-standarden/132-meningsfylt-rekkefolge-niva/91) Meningsfylt rekkefølge (A) | Presenter innhold i en meningsfull rekkefølge. | Oppfylt |
| [1.3.3](https://www.uutilsynet.no/wcag-standarden/133-sensoriske-egenskaper-niva/92) Sensoriske egenskaper (A) | Instruksjoner må ikke utelukkende være avhengige av form, størrelse, visuell plassering, orientering, eller lyd for å kunne bli forstått. | Oppfylt  |
| [1.3.4](https://www.uutilsynet.no/wcag-standarden/134-visningsretning-niva-aa/141) Visningsretning (AA) | Brukeren må få velge om innholdet skal vises i liggende eller stående retning. | Automatisk testet |
| [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) Identifiser formål med inndata (AA) | Skjemaelementer er kodet med inndataformål. | Oppfylt |
| [1.4.1](https://www.uutilsynet.no/wcag-standarden/141-bruk-av-farge-niva/93) Bruk av farge (A) | Ikke bruk presentasjon som bygger utelukkende på farge. | Automatisk testet |
| [1.4.2](https://www.uutilsynet.no/wcag-standarden/142-styring-av-lyd-niva/94) Styring av lyd (A) | Gi brukeren mulighet til å stoppe eller pause lyd som starter automatisk. | Oppfylt |
| [1.4.3](https://www.uutilsynet.no/wcag-standarden/143-kontrast-minimum-niva-aa/95) Kontrast, minimum (AA) | Kontrastforholdet mellom teksten og bakgrunnen er minst 4,5:1. | Oppfylt |
| [1.4.4](https://www.uutilsynet.no/wcag-standarden/144-endring-av-tekststorrelse-niva-aa/96) Endring av tekststørrelse (AA) | Tekst kan bli endret til 200 % størrelse uten tap av innhold eller funksjon. | Automatisk testet |
| [1.4.5](https://www.uutilsynet.no/wcag-standarden/145-bilder-av-tekst-niva-aa/97) Bilder av tekst (AA) | Bruk tekst i stedet for bilder av tekst. | Automatisk testet |
| [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144) Dynamisk tilpasning, reflow (AA) | Innhold skal kunne endres til 400 % størrelse ved 1280 piksler bredde, uten tap av informasjon eller funksjonalitet. | Avvik |
| [1.4.11](https://www.uutilsynet.no/wcag-standarden/1411-kontrast-ikke-tekstlig-innhold-niva-aa/145) Kontrast for ikke-tekstlig innhold (AA) | Ikke-tekstlig innhold skal ha et kontrastforhold på minst 3:1 mot farge(r) som ligger ved siden av. | Automatisk testet |
| [1.4.12](https://www.uutilsynet.no/wcag-standarden/1412-tekstavstand-niva-aa/146) Tekstavstand (AA) | Tekstavstanden skal kunne overstyres for å gjøre teksten lettere å lese. | Automatisk testet |
| [1.4.13](https://www.uutilsynet.no/wcag-standarden/1413-pekerfolsomt-innhold-eller-innhold-ved-tastaturfokus-niva-aa/147) Pekerfølsomt innhold eller innhold ved tastaturfokus (AA) | Brukeren skal ha mer kontroll over innholdet på nettsiden som får fokus med musepeker eller tastatur. | Automatisk testet |

### Mulig å betjene

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98) Tastatur (A) | All funksjonalitet skal kunne brukes kun ved hjelp av tastatur. | Automatisk testet |
| [2.1.2](https://www.uutilsynet.no/wcag-standarden/212-ingen-tastaturfelle-niva/99) Ingen tastaturfelle (A) | Unngå tastaturfeller. | Automatisk testet |
| [2.1.4](https://www.uutilsynet.no/wcag-standarden/214-hurtigtaster-som-bestar-av-ett-tegn-niva/782) Hurtigtaster som består av ett tegn (A) | Brukeren skal enkelt kunne slå av hurtigtaster som består av ett tegn. | Oppfylt (appens eget innhold) |
| [2.2.1](https://www.uutilsynet.no/wcag-standarden/221-justerbar-hastighet-niva/100) Justerbar hastighet (A) | Tidsbegrensninger skal kunne justeres av brukeren. | Oppfylt |
| [2.2.2](https://www.uutilsynet.no/wcag-standarden/222-pause-stopp-skjul-niva/101) Pause, stopp, skjul (A) | Gi brukeren mulighet til å stoppe, pause eller skjule innhold som automatisk endrer seg. | Automatisk testet |
| [2.3.1](https://www.uutilsynet.no/wcag-standarden/231-terskelverdi-pa-maksimalt-tre-glimt-niva/102) Terskelverdi på maksimalt tre glimt (A) | Innhold skal ikke blinke mer enn tre ganger per sekund. | Automatisk testet |
| [2.4.1](https://www.uutilsynet.no/wcag-standarden/241-hoppe-over-blokker-niva/103) Hoppe over blokker (A) | Gi brukeren mulighet til å hoppe direkte til hovedinnholdet. | Automatisk testet |
| [2.4.2](https://www.uutilsynet.no/wcag-standarden/242-sidetitler-niva/104) Sidetitler (A) | Bruk nyttige og tydelige sidetitler. | Automatisk testet |
| [2.4.3](https://www.uutilsynet.no/wcag-standarden/243-fokusrekkefolge-niva/105) Fokusrekkefølge (A) | Presenter innholdet i en logisk rekkefølge. | Automatisk testet |
| [2.4.4](https://www.uutilsynet.no/wcag-standarden/244-formal-med-lenke-i-kontekst-niva/106) Formål med lenke, i kontekst (A) | Alle lenkers mål og funksjon fremgår tydelig av lenketeksten. | Automatisk testet |
| [2.4.5](https://www.uutilsynet.no/wcag-standarden/245-flere-mater-niva-aa/107) Flere måter (AA) | Tilby brukeren flere måter å navigere på. | Ikke vurdert |
| [2.4.6](https://www.uutilsynet.no/wcag-standarden/246-overskrifter-og-ledetekster-niva-aa/108) Overskrifter og ledetekster (AA) | Sørg for at ledetekster og overskrifter er beskrivende. | Automatisk testet |
| [2.4.7](https://www.uutilsynet.no/wcag-standarden/247-synlig-fokus-niva-aa/109) Synlig fokus (AA) | Sørg for at alt innhold får synlig fokus når du navigerer med tastatur. | Automatisk testet |
| [2.5.1](https://www.uutilsynet.no/wcag-standarden/251-pekerbevegelser-niva/148) Pekerbevegelser (A) | Innhold på nettsiden skal kunne brukes med enkel pekerinput. | Automatisk testet |
| [2.5.2](https://www.uutilsynet.no/wcag-standarden/252-pekeravbrytelse-niva/149) Pekeravbrytelse (A) | Uheldige og feilaktige input via mus eller berøringsskjerm skal lettere kunne forhindres. | Automatisk testet |
| [2.5.3](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150) Ledetekst i navn (A) | Brukere som bruker visuelle ledetekster skal også kunne bruke kodede ledetekster. | Automatisk testet |
| [2.5.4](https://www.uutilsynet.no/wcag-standarden/254-bevegelsesaktivering-niva/151) Bevegelsesaktivering (A) | Funksjonalitet som kan betjenes med å bevege enheten eller ved brukerbevegelse, skal også kunne betjenes med brukergrensesnittkomponenter. | Automatisk testet |

### Forståelig

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [3.1.1](https://www.uutilsynet.no/wcag-standarden/311-sprak-pa-siden-niva/110) Språk på siden (A) | Sørg for at språket til innholdet på alle nettsider er angitt i koden. | Oppfylt (appens eget innhold) |
| [3.1.2](https://www.uutilsynet.no/wcag-standarden/312-sprak-pa-deler-av-innhold-niva-aa/111) Språk på deler av innhold (AA) | Sørg for at alle deler av innholdet som er på et annet språk enn resten av siden er markert i koden. | Ikke vurdert |
| [3.2.1](https://www.uutilsynet.no/wcag-standarden/321-fokus-niva/112) Fokus (A) | Når en komponent kommer i fokus medfører dette ikke automatisk betydelige endringer i siden. | Automatisk testet |
| [3.2.2](https://www.uutilsynet.no/wcag-standarden/322-inndata-niva/114) Inndata (A) | Endring av verdien til et skjemafelt medfører ikke automatisk betydelige endringer i siden. | Automatisk testet |
| [3.2.3](https://www.uutilsynet.no/wcag-standarden/323-konsekvent-navigering-niva-aa/113) Konsekvent navigering (AA) | Navigasjonslenker som gjentas på flere sider skal ha en konsekvent rekkefølge. | Automatisk testet |
| [3.2.4](https://www.uutilsynet.no/wcag-standarden/324-konsekvent-identifikasjon-niva-aa/115) Konsekvent identifikasjon (AA) | Elementer som har samme funksjonalitet på tvers av flere sider er utformet likt. | Automatisk testet |
| [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116) Identifikasjon av feil (A) | For feil som oppdages automatisk må du vise hvor feilen har oppstått og gi en tekstbeskrivelse av feilen. | Automatisk testet |
| [3.3.2](https://www.uutilsynet.no/wcag-standarden/332-ledetekster-eller-instruksjoner-niva/117) Ledetekster eller instruksjoner (A) | Det vises ledetekster eller instruksjoner når du har skjemaelementer som må fylles ut. | Automatisk testet |
| [3.3.3](https://www.uutilsynet.no/wcag-standarden/333-forslag-ved-feil-niva-aa/118) Forslag ved feil (AA) | Dersom feil blir oppdaget automatisk, gi brukeren et forslag til hvordan feilen kan rettes. | Automatisk testet |
| [3.3.4](https://www.uutilsynet.no/wcag-standarden/334-forhindring-av-feil-juridiske-feil-okonomiske-feil-datafeil-niva-aa/119) Forhindring av juridiske feil, økonomiske feil og datafeil (AA) | For sider som medfører juridiske forpliktelser må det være mulig å kunne angre, kontrollere eller bekrefte dataene som sendes inn. | Ikke vurdert |

### Robust

| Krav | Kort fortalt | Status |
| --- | --- | --- |
| [4.1.1](https://www.uutilsynet.no/wcag-standarden/411-parsing-oppdeling-niva/120) Parsing, oppdeling (A) | Alle sider skal være uten store kodefeil. | Automatisk testet |
| [4.1.2](https://www.uutilsynet.no/wcag-standarden/412-navn-rolle-verdi-niva/121) Navn, rolle, verdi (A) | Alle komponenter har navn og rolle bestemt i koden. | Avvik |
| [4.1.3](https://www.uutilsynet.no/wcag-standarden/413-statusbeskjeder-niva-aa/152) Statusbeskjeder (AA) | Brukeren skal få statusbeskjeder om viktige endringer på nettsiden uten at det gir kontekstendring. | Automatisk testet |

### Manuell kontroll som gjenstår for «Automatisk testet»

- [ ] 1.1.1: skjermleser: om tekstalternativene formidler riktig informasjon.
- [ ] 1.3.4: rotasjon på ekte mobil og nettbrett.
- [ ] 1.4.1: visuell vurdering av om informasjon kan forstås uten farge.
- [ ] 1.4.4: visuell kontroll av klipping og overlapp ved 200 %.
- [ ] 1.4.5: vurdering av om bilder formidler tekst.
- [ ] 1.4.11: visuell kontroll av tilstander og grafikk som testene ikke dekker.
- [ ] 1.4.12: visuell vurdering av om informasjon går tapt.
- [ ] 1.4.13: kontroll av dekoratøren og av innhold som bare vises i tilstander testene ikke når.
- [ ] 2.1.1: gjennomføring av alle flyter med tastatur.
- [ ] 2.1.2: manuell tastaturnavigering i alle flyter.
- [ ] 2.4.2: vurdering av om titlene er beskrivende.
- [ ] 2.4.1: kontroll i dev og prod av at «Hopp til hovedinnhold» er første stopp med Tab og flytter til skjemaet, også på feilsidene.
- [ ] 2.4.4: vurdering av lenketekstene. «Lukk» på visningssidene går til Min side – arbeidsgiver. Lenkene «Her» på kvitteringen i omsorgspenger oppfyller kravet med teksten i avsnittet, men lenketekster som «Her finner du oversikt over saksbehandlingstiden», slik kvitteringen i inntektsmelding har, er tydeligere.
- [ ] 2.4.6: vurdering av om overskrifter og ledetekster beskriver innholdet. Kontaktfeltet heter «Telefon» i inntektsmelding og AGI og «Telefonnummer» i omsorgspenger.
- [ ] 2.4.7: manuell tastaturnavigering med visuell kontroll av fokus.
- [ ] 3.2.1: manuell tastaturnavigering.
- [ ] 2.2.2 og 2.3.1: se gjennom flytene, også under lasting, etter innhold som beveger seg, blinker eller oppdateres av seg selv.
- [ ] 2.5.1, 2.5.2 og 2.5.4: kontroll på mobil med berøringsskjerm, slik Uu-tilsynet tester 2.5.1.
- [ ] 2.5.3: kontroll med stemmestyring av at kontrollene kan aktiveres med den synlige teksten.
- [ ] 3.2.2: endring av felt med tastatur og skjermleser i alle flyter, også felt testene ikke når, for eksempel AGI-refusjon og refusjonssteget i omsorgspenger.
- [ ] 3.2.3 og 3.2.4: vurdering av om knapper med samme funksjon har konsekvente navn. Forslag: Knappen for å gå videre heter «Bekreft og gå videre» i Dine opplysninger og «Neste steg» i de andre stegene. Dekoratøren er ikke kontrollert.
- [ ] 3.3.2: vurdering av om ledetekstene og instruksjonene sier hva som skal fylles ut, og at nye valgfrie felt er merket med «(valgfritt)».
- [ ] 3.3.3: vurdering av ordlyden i feilmeldingene. Forslag: «Du må fylle ut et gyldig fødselsnummer» i AGI sier ikke hva som er feil, for eksempel «Fødselsnummeret må ha 11 siffer. Sjekk at det er skrevet riktig.». «Beløpet er for stort» sier ikke hva grensen er.
- [ ] 3.3.1: skjermleser: at feilen leses opp sammen med feltet, og at alle typer inndatafeil er dekket, også datofelt og feil fra serveren.
- [ ] 4.1.3: skjermleser: at statusbeskjeder leses opp uten å flytte fokus, og at de ikke gjentas eller avbryter unødig. Gjelder særlig varsler som ikke dekkes av testene, for eksempel feil ved personoppslag og henting av virksomheter.
- [ ] 4.1.1: validering av ferdig rendrede sider med W3C-validatoren, slik Uu-tilsynet gjør. Det gjelder også siden med dekoratøren fra serveren.

### Dokumenterte bevis og avvik

- 1.1.1, 1.4.1, 1.4.3 og 1.4.5 er vurdert for appens eget innhold. Dekoratøren er forutsatt uten avvik. PDF-innhold er ikke vurdert.
- 1.3.5: Kontaktfeltet har `autocomplete="name"` eller `"tel"` i alle fire flyter. Opplysninger om den ansatte omfattes ikke.
- 1.4.3: Tekst, lenker, hjelpetekst og feil er målt i alle fire flyter. Ingen kontrastavvik ble funnet. Se seksjon 5.
- 1.3.4: Hverken appen eller Aksel har CSS som avhenger av retningen, og ingen kode låser retningen. En egen test viser Dine opplysninger, Inntekt og refusjon, Opprett inntektsmelding og Refusjon av omsorgspenger ved 360 × 640 og 640 × 360. Innholdet er det samme i begge retninger, og det blir ikke vannrett rulling.
- 1.4.4: Alle fire flyter er kontrollert med 200 % nettleserzoom fra 1920 piksler bredde. Den permanente zoomtesten dekker vanlig inntektsmelding.
- 1.4.11: Ved hvert UU-sjekkpunkt måler testene avgrensningen til felt, radioknapper og avkrysningsbokser, valgt radioknapp, bryteren for hjelpetekster og ikoner i knapper, lenker og nedtrekkslister. De måler også fokusmarkeringen for alle elementer i `main` som kan få fokus. Alt er minst 3:1. Valgt dag i kalenderen (omtrent 6:1) og avkrysset boks i unntatt-Aa-flyten (omtrent 5,5:1) er målt for seg. Lesefelt med lås, for eksempel første «Fra og med», har svak kant (1,5:1). De er ikke regnet som aktive felt, fordi verdien ikke kan endres. Dette er en vurdering. Hover og grafikk uten tekst er ikke målt. Grafikken i appen har tekst ved siden av.
- 1.4.12: Ved hvert UU-sjekkpunkt legger testene på linjehøyde 1,5, avsnittsavstand 2, bokstavavstand 0,12 og ordavstand 0,16 samtidig. Testene ser etter tekst som klippes, og tekstlinjer som overlapper. Det gjelder alle fire flyter, innsendte skjemaer, feilsider, åpne kontroller, 320 piksler og ekte zoom. Ingen tap ble funnet. Kvitteringen og den åpne datovelgeren er også kontrollert visuelt.
- 1.4.13: Appen har ikke innhold som vises ved hover eller tastaturfokus. Hjelpetekster, «Les mer», menyer, datovelgeren og virksomhetslisten åpnes med klikk, og nettleserens `title`-verktøytips er unntatt. Ved hvert UU-sjekkpunkt setter testene fokus på og holder pekeren over hvert element i `main` som kan få fokus, og ser etter nytt innhold i `main` eller i et lag over siden. Testene venter 200 ms over ikonknapper uten synlig tekst, fordi Aksels `Tooltip` åpnes etter 150 ms. Hver side kontrolleres én gang per worker. Ingen funn. Hvis det kommer slikt innhold, må det kunne lukkes med Escape, pekeren må kunne flyttes over det, og det må bli stående.
- 1.4.10: Ved 320 CSS-piksler og 400 % zoom gir datoperioder i «Omsorgsdager» 64 piksler vannrett overløp. [DateRangePickerWrapped](./app/src/features/shared/react-hook-form-wrappers/DateRangePickerWrapped.tsx) tvinger feltene ved siden av hverandre, selv om layouten ikke krever to dimensjoner.
- 2.1.4: Appen har ingen hurtigtaster og lytter ikke etter tastetrykk utenfor skjemafeltene. Ved hvert UU-sjekkpunkt fjerner testene fokus fra skjemafeltene og trykker a–z, 0–9 og vanlige tegn. Adresse, innhold, fokus, åpne dialoger og rulleposisjon skal være uendret. Aksel-komponenter reagerer bare på taster når de selv har fokus, og det er tillatt etter kravet.
- 2.2.2 og 2.3.1: Ved hvert UU-sjekkpunkt leser testene alle animasjoner som kjører i `main`. De ser etter animasjoner som går i det uendelige eller varer over fem sekunder, animasjoner med mer enn tre gjentatte runder per sekund, og `video` og `audio`. Axe dekker `marquee` og `blink`. Ingen ble funnet. Den eneste animasjonen i appen er Aksels `Loader` under lasting. Den forsvinner når opplysningene er hentet, og er en del av lastingen.
- 2.4.2: Alle steg, innsendte skjemaer og feilsider har en tittel som sier hva siden gjelder, og hvilken ytelse eller søknad den hører til. UU-testene kontrollerer forventet tittel ved hvert sjekkpunkt. Det fanger også en gammel tittel som blir stående etter navigering. Under lasting står tittelen fra forrige side eller «Inntektsmelding».
- 2.5.1, 2.5.2 og 2.5.4: Appen bruker ingen bevegelser, ingen handlinger ved trykk ned og ingen sensorer. Alt betjenes med vanlige klikk. [pekerOgBevegelse.spec.ts](./app/src/pekerOgBevegelse.spec.ts) feiler hvis koden tar i bruk hendelser for bevegelser (`touchmove`, `pointermove`, `gesture*`), trykk ned (`mousedown`, `pointerdown`, `touchstart`) eller sensorer (`devicemotion`, `deviceorientation`). Ved hvert UU-sjekkpunkt trykker testene ned museknappen på hvert element i `main`, flytter pekeren bort og slipper. Ingenting skal skje, verken ved trykket eller etter at handlingen er avbrutt. Testene kontrollerer også at `window` ikke lytter på `devicemotion` eller `deviceorientation`. Ingen funn, heller ikke i Aksel-komponentene.
- 2.5.3: Ved hvert UU-sjekkpunkt sammenligner testene synlig tekst eller ledetekst med det tilgjengelige navnet for alle knapper, lenker og skjemafelt. Axe-regelen `label-content-name-mismatch` kjører også. Slette-knappen for refusjonsperiode 3 og senere viste «Slett», men het «Fjern refusjonsendring». Den heter nå «Slett refusjonsperiode». Testene dekker nå tre refusjonsperioder.
- 3.2.2: Koden har ingen endringshåndterere som navigerer, sender inn eller åpner vinduer. Egne tester endrer alle felt, også felt som dukker opp underveis, i Dine opplysninger, Inntekt og refusjon, Opprett inntektsmelding og steg 1–3 i omsorgspenger. Adresse, hovedoverskrift og antall vinduer skal være uendret, ingen dialog skal åpnes, og fokus skal bli værende i feltet. Når årsak til endret inntekt ble valgt, ble raden bygget på nytt, og fokus havnet på `body`. Det er rettet ved å nullstille feltene i raden enkeltvis i stedet for med `update()`.
- 2.4.1: Dekoratøren har lenken «Hopp til hovedinnhold» med mål `#maincontent`. Den er første lenke på siden. Skjemaene har `<main id="maincontent">`, men de tre feilsidene for utgått oppgave, generell feil og «Fant ikke siden» hadde `<main>` uten `id`, så lenken gikk ingen steder. Det er rettet. Ved hvert UU-sjekkpunkt kontrollerer testene at `main` har `id="maincontent"`. Dekoratøren er ikke med når testene kjører lokalt, så selve lenken må kontrolleres i dev eller prod.
- 2.4.6: Overskriftene beskriver stegene og seksjonene, og ledetekstene beskriver feltene. Felt med samme ledetekst, som «Fra og med» og «Ja», skilles av spørsmålet eller feltgruppen de står i, for eksempel «Refusjonsperiode 2». Avvik som er rettet: Tolv visningstekster brukte Aksels `Label` uten `as`, slik at de ble `<label>` uten felt, for eksempel «Navn», «Virksomhetsnavn», «Refusjonsbeløp per måned» og «Eksempel 1:». De bruker nå `as="p"`. Hilsenen «Hei Ola!» i veiledningspanelet i Dine opplysninger og Om refusjon var en h3-overskrift, men beskriver ikke innholdet under. Den er nå uthevet tekst. Ved hvert UU-sjekkpunkt rapporterer testene `<label>` uten felt, like overskrifter på samme nivå og felt med samme ledetekst i samme feltgrupper.
- 2.4.4: Uu-tilsynet regner bare tekst i samme avsnitt, liste eller tabellcelle som lenkekontekst, ikke overskrifter. Avvik som er rettet: Oppsummeringen i omsorgspenger hadde fire lenker som het «Endre svar». Den synlige teksten er beholdt, men lenkene har fått `aria-label`: «Endre svar om refusjon», «Endre svar om arbeidsgiver og den ansatte», «Endre svar om omsorgsdager» og «Endre svar om beregnet månedslønn». Seende brukere ser hvilken seksjon lenken hører til. Navnet begynner med den synlige teksten, slik 2.5.3 krever. Lenken under «Om refusjon» gikk til steget for beregnet månedslønn, selv om svarene var fra «Om refusjon». Nå går den til steg 1. Visningssidene hadde to lenker som bare het «Endre». De viser fortsatt «Endre», men har `aria-label` «Endre inntektsmeldingen». Ved hvert UU-sjekkpunkt kontrollerer testene at generiske lenketekster som «Her», «Les mer» og «Endre» har forklarende tekst i samme avsnitt, liste eller tabellcelle, og at lenker med samme navn ikke går til ulike steder uten kontekst som skiller dem.
- 3.2.3 og 3.2.4: Alle steg har samme rekkefølge: «Vis alle steg» øverst, deretter innholdet, «Forrige steg», knappen for å gå videre og «Avbryt». Ved hvert UU-sjekkpunkt husker testene lenkene og knappene fra tidligere sjekkpunkter i samme test. Elementer som går igjen, skal stå i samme rekkefølge, og lenker til samme adresse skal ha samme navn, eller et navn der det ene inneholder det andre. «Avbryt» og «Forrige steg» er unntatt, fordi de kan gå til samme side som andre lenker med en annen funksjon. Avvik som er rettet: Nedlastingen i omsorgspenger het «Last ned refusjonskrav» på kvitteringen og «Last ned PDF» på siden for innsendt refusjonskrav. Begge heter nå «Last ned refusjonskrav». Lenken til Min side het «Gå til Min side - arbeidsgiver», «Gå til Min side arbeidsgiver» eller «Gå til min side – arbeidsgiver». Nå heter den «Gå til Min side – arbeidsgiver» overalt.
- 3.3.1: Ved hvert UU-sjekkpunkt kontrollerer testene at hver synlige feilmelding er koblet til et felt med `aria-describedby`, og at feltet eller feltgruppen har `aria-invalid="true"`. De kontrollerer også at hvert felt som er merket ugyldig, har en synlig feilmelding. Valideringsfeil er testet i alle fire flyter. Etter innsending flyttes fokus til første felt med feil. På «Den ansatte og arbeidsgiver» manglet fødselsnummeret og avkrysningen for Aa-registeret `ref`, så fokus ble stående på «Neste steg». Det er rettet.
- 3.3.3: Meldinger om tomme felt sier hva som mangler. Meldinger om feil format eller verdi sier hva som er gyldig, for eksempel 8 siffer for telefonnummer, høyst 100 tegn i navn, beløpsgrenser, høyst 24 timer og at fra og med må være før til og med. Det brukeren har skrevet, blir stående, og fokus flyttes til første felt med feil. «Må oppgis» og «… er påkrevd» er byttet ut med meldinger som sier hva som mangler, for eksempel «Du må oppgi telefonnummer» og «Du må velge årsak til endringen». Avvik: En dato som ikke kunne tolkes, for eksempel «31.02.2024», «abc» eller «2024-04-01», ga «Må oppgis» eller «Du må oppgi en dato», selv om teksten sto i feltet. Nå viser begge datokomponentene «Datoen er ikke gyldig. Skriv den som dd.mm.åååå, for eksempel 01.04.2024.». I datoperioder ga en til og med-dato før fra og med «Du må oppgi en til og med dato». Nå står det «Til og med: Datoen kan ikke være før fra og med.». Ved hvert UU-sjekkpunkt kontrollerer testene at et felt med innhold ikke har en melding om manglende verdi. En egen test skriver ugyldige datoer i AGI og omsorgspenger. En feiloppsummering er ikke påkrevd, fordi fokus flyttes til feilen.
- 3.3.2: Alle felt har en synlig `<label>` rett ved feltet, og alle radiogrupper har et synlig spørsmål i `legend`. Appen bruker verken plassholdertekst eller `title` som ledetekst. Skjemaene opplyste ikke om at alle felt må fylles ut. Nå starter hvert steg med «Alle felt må fylles ut.». Felt som først vises etter et valg, for eksempel ved endring av inntekt, må fylles ut når de vises. Det er kontrollert for alle endringsårsaker i inntektsmelding og omsorgspenger. «Til og med» blir deaktivert når brukeren krysser av for at fraværet fortsatt pågår. «Ble kjent fra» ved tariffendring kan stå tomt i omsorgspenger. Backend krever ikke feltet, og det er ikke endret. «Refusjonsbeløp per måned» ved endring av lik refusjon godtok tomt felt og sendte inn 0 kr. Feltet er nå påkrevd, slik som i de andre refusjonsperiodene. Får skjemaet valgfrie felt, skal ledeteksten merkes med «(valgfritt)». Ved hvert UU-sjekkpunkt kontrollerer testene ledetekst og spørsmål, og at «Alle felt må fylles ut.» står før første felt.
- 4.1.3: Aksels `Alert` og `Loader` har ingen rolle, og feilmeldinger i datoperioder lå utenfor en live-region. Varsler og lasteindikatorer som dukker opp etter en handling, ble derfor ikke lest opp. Systemfeil, som feil ved innsending, personoppslag og henting av data, har nå `role="alert"`. Valideringsfeil som ikke hører til ett felt, for eksempel manglende fravær og overlappende naturalytelser, ligger i en `aria-live="polite"`-container som alltid finnes, slik at de leses opp uten å avbryte brukeren. Informasjon, advarsler og lasteindikatorer har `role="status"`, for eksempel ved refusjonsvalg og 6G-grensen. Feltfeil fra Aksel ligger allerede i `aria-live`. Ved hvert UU-sjekkpunkt kontrollerer testene at varsler, lasteindikatorer og feilmeldinger som er lagt til etter en handling på samme side, ligger i en live-region. Lasteindikatoren inne i knapper som laster, er unntatt. Knappen beholder fokus, og navnet endres til «Venter…».
- 4.1.1: Ved hvert UU-sjekkpunkt ser testene etter like ID-er og feil nøsting, for eksempel blokkelementer i `p` eller overskrifter, interaktive elementer inni lenker og knapper, og feil barn av tabellrader. Axe dekker feil i lister og `dl`. Ufullstendige elementer og dupliserte attributter finnes ikke i en DOM, så de må sjekkes med validatoren. Overskriftene i «Ofte stilte spørsmål» på kvitteringene inneholdt en `div` og bruker nå `span`. Utviklerverktøyene til TanStack har like ID-er, men vises bare lokalt og er utelatt fra kontrollen.
- 2.1.1, 2.1.2, 2.4.3, 2.4.7 og 3.2.1: Ved hvert UU-sjekkpunkt tabber testene gjennom hele `main` med ekte tastatur, forover og bakover. Alle elementer som kan få fokus, blir nådd, og ingen elementer har positiv `tabindex`. Fokusrekkefølgen følger DOM-rekkefølgen og hopper ikke oppover, og bakover gir samme rekkefølge snudd. Fokus blir ikke fanget, er synlig (`:focus-visible`) og ligger innenfor skjermen. Fokus endrer verken adresse eller hovedoverskrift. Ingen elementer kan bare brukes med mus. Unntaket er pilen i Aksels nedtrekksliste, der listen kan åpnes og brukes med piltaster. Egne tester viser at kalenderen kan brukes med tastatur og lukkes med Escape, og at fokus da går tilbake til knappen. Ved 320 px går Tab fra «Lukk» via nettleseren tilbake til den modale kalenderen. Det er vanlig oppførsel og ingen felle. Ved stegbytte flyttes fokus til overskriften for det nye steget (F03).
- 3.1.1: Alle sider kommer fra [index.html](./app/index.html) med `lang="nb-no"`. Serveren legger dekoratøren inn i `<head>` og `<body>` uten å endre `<html>`, og produksjonsbygget beholder attributtet. UU-testene kontrollerer sidespråket og axe-reglene for språk på hele dokumentet ved hvert sjekkpunkt. Den engelske teksten på den generelle feilsiden er merket med `lang="en"`.
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

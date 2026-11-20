# Sjekkliste for universell utforming

Dette dokumentet viser hva teamet må undersøke og dokumentere før vi kan konkludere om etterlevelse for inntektsmelding og refusjon for omsorgspenger.

Status 20. november 2026: Axe-testene består. Flere forhold må fortsatt undersøkes. Vi har ikke gjennomført en full kontroll eller kontrollert produksjon. Dokumentet er en arbeidsliste, ikke en tilgjengelighetserklæring eller godkjenning.

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

### F02: Hovedinnholdet er bredere enn visningsområdet

**Må undersøkes mot 1.4.10 Dynamisk tilpasning.**

Ved 320 CSS-piksler målte vi hovedinnholdets bredde til 340 piksler. Hjelpetekstområdet og, etter åpning av inntektsfeltet, tilbakestillingsknappen hadde elementgrenser utenfor visningsområdet. Målingen alene avgjør ikke om brukeren mister innhold eller må rulle vannrett for å bruke det.

- [ ] Gjenta testen i produksjonslikt miljø uten utviklerverktøyknapper i siden.
- [ ] Kontroller 320 CSS-piksler og 400 % zoom med utgangspunkt i et 1280 piksler bredt nettleservindu.
- [ ] Undersøk [HjelpetekstToggle](./app/src/features/shared/Hjelpetekst.tsx) og raden med inntektsfelt og tilbakestillingsknapp i [Inntekt](./app/src/features/shared/skjema-moduler/Inntekt.tsx).
- [ ] Registrer om tekst eller kontroller blir skjult, overlapper eller krever vannrett rulling.

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

### F05: Kontrastfunn fra axe krever manuell vurdering

De 35 axe-skanningene har åtte `incomplete`-funn om kontrast. Disse er verken bekreftede avvik eller beståtte kontroller.

- [ ] Kontroller øvrige brukssteder og varianter som ikke inngår i axe-testene.
- [ ] Mål kontrasten manuelt der axe rapporterer `incomplete`.

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

Testene merket `@uu` kjører også i den ordinære E2E-jobben i CI. De dekker vanlig inntektsmelding, arbeidsgiverinitiert inntektsmelding for nyansatte og unntatt Aa-registeret, samt refusjon for omsorgspenger. Visning av innsendte inntektsmeldinger og refusjonskrav inngår i alle fire flyter. Kontrollene bruker WCAG 2.1 A/AA-tagger uten deaktiverte regler. JSON-rapporter med funn og forhold som krever manuell vurdering lagres per steg. Se [testdokumentasjonen](./app/tests/README.md) for dekning og rapporter.

Skanningene er avgrenset til `main`. De dekker ikke hele dokumentet, dekoratøren, innloggingen, alle varianter eller mobilvisning. Beståtte axe-tester, funksjonstester, typekontroll og lint er ikke en UU-godkjenning.

### Testgrunnlag og gjenstående kontroll for 1.3.1

Ti UU-tester med 35 axe-skanninger og 27 målrettede valideringstester besto 20. november 2026. UU-testene kontrollerer også overskriftshierarki, navngitte seksjoner, gjentakende feltgrupper og kobling mellom kontaktfelt og feilmeldinger. Skjermbilder fra de berørte sidene er kontrollert ved 1280 × 720 CSS-piksler.

Ingen egne HTML-tabeller ble funnet i app-koden eller de undersøkte tilstandene. Månedsinntektene vises som fortløpende måned–beløp-par i et CSS-grid.

- [ ] Bekreft overskriftsnavigasjon og navngitte feltgrupper med skjermleser, inkludert flere rader og sletting.
- [ ] Kontroller leserekkefølgen for månedsinntekter og sammenhengen mellom måned og beløp med skjermleser.
- [ ] Dekk øvrige ytelsesvarianter, serverfeil og mobilvisning. PDF-innhold er ikke vurdert.

## 6. Vurder alle 48 WCAG-krav

Status gjelder vurderingen av tjenesten som helhet. «Ikke vurdert» inkluderer krav der vi bare har gjort stikkprøver. For hvert krav må resultatene kobles til testomfanget og bevisene fra seksjon 2.

### Mulig å oppfatte

| Krav | Hva vi skal kontrollere og hvordan | Status |
| --- | --- | --- |
| [1.1.1](https://www.uutilsynet.no/wcag-standarden/111-ikke-tekstlig-innhold-niva/87) Ikke-tekstlig innhold (A) | Appens egne bilder og ikoner er gjennomgått i kildekoden. Dekorasjonen har tomt tekstalternativ eller er skjult for hjelpemidler, og handlinger har tekst. Axe-testene dekker de fire skjemaflytene og visning av innsendte skjemaer uten avvik. Vurderingen gjelder appens eget innhold, med forutsetningen om dekoratøren over. PDF-innhold er ikke vurdert. | Oppfylt (appens eget innhold) |
| [1.2.1](https://www.uutilsynet.no/wcag-standarden/121-bare-lyd-og-bare-video-forhandsinnspilt-niva/88) Bare lyd og bare video, forhåndsinnspilt (A) | Kartlegg eventuelle lydklipp og videoer uten lyd, også i innebygd innhold. Kontroller nødvendige alternativer. Begrunn «Ikke relevant» hvis innholdet ikke finnes. | Oppfylt  |
| [1.2.2](https://www.uutilsynet.no/wcag-standarden/122-teksting-forhandsinnspilt-niva/89) Teksting, forhåndsinnspilt (A) | Spill av eventuell forhåndsinnspilt video med lyd. Kontroller at tekstingen dekker tale og nødvendig lydinformasjon og følger innholdet. | Oppfylt  |
| [1.2.5](https://www.uutilsynet.no/wcag-standarden/125-synstolking-forhandsinnspilt-niva-aa/842) Synstolking, forhåndsinnspilt (AA) | Kartlegg relevant video og publiseringsdato. Kontroller at nødvendig visuell informasjon formidles gjennom lyd etter tilsynets krav og unntak. | Oppfylt  |
| [1.3.1](https://www.uutilsynet.no/wcag-standarden/131-informasjon-og-relasjoner-niva/90) Informasjon og relasjoner (A) | Overskrifter, seksjoner, gjentakende feltgrupper, feltnavn, lister og feilkoblinger er kontrollert i kildekode og utvalgte rendrede tilstander. Automatiske strukturkontroller består. Full skjermleserkontroll og øvrig testomfang gjenstår, se seksjon 5. | Ikke vurdert |
| [1.3.2](https://www.uutilsynet.no/wcag-standarden/132-meningsfylt-rekkefolge-niva/91) Meningsfylt rekkefølge (A) | Les siden med skjermleser og undersøk DOM-rekkefølgen. Kontroller særlig kolonner, inntektsoversikter og dato- og beløpspar når layouten endres. | Ikke vurdert |
| [1.3.3](https://www.uutilsynet.no/wcag-standarden/133-sensoriske-egenskaper-niva/92) Sensoriske egenskaper (A) | Les instruksjoner og feilmeldinger. De skal ikke bare vise til plassering, form, farge, størrelse eller lyd for å forklare en handling. | Ikke vurdert |
| [1.3.4](https://www.uutilsynet.no/wcag-standarden/134-visningsretning-niva-aa/141) Visningsretning (AA) | Roter mobil og nettbrett. Innhold og betjening skal fungere i begge retninger uten unødvendig låsing. | Ikke vurdert |
| [1.3.5](https://www.uutilsynet.no/wcag-standarden/135-identifiser-formal-med-inndata-niva-aa/142) Identifiser formål med inndata (AA) | Kontroller riktig programmatisk formål, blant annet `autocomplete` for kontaktpersonens navn og telefon når opplysningene gjelder den som fyller ut. Skill dette fra opplysninger om den ansatte. | Ikke vurdert |
| [1.4.1](https://www.uutilsynet.no/wcag-standarden/141-bruk-av-farge-niva/93) Bruk av farge (A) | Kontroller feil, valgte steg, varsler og endrede verdier uten å støtte deg på farge. Informasjon skal også fremgå på andre måter. | Ikke vurdert |
| [1.4.2](https://www.uutilsynet.no/wcag-standarden/142-styring-av-lyd-niva/94) Styring av lyd (A) | Undersøk om lyd starter automatisk og varer mer enn tre sekunder. Kontroller nødvendig stopp, pause eller uavhengig volumkontroll hvis det forekommer. | Ikke vurdert |
| [1.4.3](https://www.uutilsynet.no/wcag-standarden/143-kontrast-minimum-niva-aa/95) Kontrast, minimum (AA) | Mål tekstkontrast, også for lenker, hjelpetekst og feil: minst 4,5:1 for vanlig tekst og 3:1 for stor tekst. Bruk WCAGs definisjon av stor tekst og vurder dokumenterte unntak. | Ikke vurdert |
| [1.4.4](https://www.uutilsynet.no/wcag-standarden/144-endring-av-tekststorrelse-niva-aa/96) Endring av tekststørrelse (AA) | Forstørr tekst til 200 %. Kontroller at felt, knapper, varsler og oppsummering ikke mister innhold eller funksjon. | Ikke vurdert |
| [1.4.5](https://www.uutilsynet.no/wcag-standarden/145-bilder-av-tekst-niva-aa/97) Bilder av tekst (AA) | Kartlegg tekst i bilder og SVG-er. Kontroller at vanlig tekst brukes der det er mulig, og vurder eventuelle unntak. | Ikke vurdert |
| [1.4.10](https://www.uutilsynet.no/wcag-standarden/1410-dynamisk-tilpasning-reflow-niva-aa/144) Dynamisk tilpasning, reflow (AA) | Test 320 CSS-piksler og 400 % zoom fra 1280 piksler. Kontroller tap av informasjon og behov for rulling i to retninger. Vurder unntak for innhold som faktisk krever todimensjonal layout. Følg opp F02. | Ikke vurdert |
| [1.4.11](https://www.uutilsynet.no/wcag-standarden/1411-kontrast-ikke-tekstlig-innhold-niva-aa/145) Kontrast for ikke-tekstlig innhold (AA) | Mål nødvendig visuell informasjon i kontroller og grafikk mot tilstøtende farger, minst 3:1 der kravet gjelder. Ta med avkrysning, feltgrenser og fokusmarkering. | Ikke vurdert |
| [1.4.12](https://www.uutilsynet.no/wcag-standarden/1412-tekstavstand-niva-aa/146) Tekstavstand (AA) | Bruk tekstinnstillingene i seksjon 5 samtidig. Kontroller at tekst, ledetekster og kontroller ikke klippes eller overlapper. | Ikke vurdert |
| [1.4.13](https://www.uutilsynet.no/wcag-standarden/1413-pekerfolsomt-innhold-eller-innhold-ved-tastaturfokus-niva-aa/147) Pekerfølsomt innhold eller innhold ved tastaturfokus (AA) | Utløs eventuelle verktøytips og annet ekstra innhold ved hover og fokus. Kontroller at det kan avvises, pekes på og forblir tilgjengelig etter kravets vilkår og unntak. | Ikke vurdert |

### Mulig å betjene

| Krav | Hva vi skal kontrollere og hvordan | Status |
| --- | --- | --- |
| [2.1.1](https://www.uutilsynet.no/wcag-standarden/211-tastatur-niva/98) Tastatur (A) | Fullfør flytene uten mus. Ta med datovelger, virksomhetsvalg, gjentakende felt, hjelpetekster, innsending og håndtering av feil. | Ikke vurdert |
| [2.1.2](https://www.uutilsynet.no/wcag-standarden/212-ingen-tastaturfelle-niva/99) Ingen tastaturfelle (A) | Gå inn og ut av alle interaktive komponenter med tastatur. Kontroller særlig kalender, nedtrekk og eventuelle dialoger. | Ikke vurdert |
| [2.1.4](https://www.uutilsynet.no/wcag-standarden/214-hurtigtaster-som-bestar-av-ett-tegn-niva/782) Hurtigtaster som består av ett tegn (A) | Kartlegg hurtigtaster. Hvis de finnes, kontroller at de kan slås av, endres eller bare virker når relevant komponent har fokus, slik kravet tillater. | Ikke vurdert |
| [2.2.1](https://www.uutilsynet.no/wcag-standarden/221-justerbar-hastighet-niva/100) Justerbar hastighet (A) | Test tidsgrenser og utlogging med innloggingsløsningen og dekoratøren. Kontroller mulighet til å slå av, justere eller forlenge tidsfristen etter kravets vilkår. Begrunn eventuelle unntak. | Ikke vurdert |
| [2.2.2](https://www.uutilsynet.no/wcag-standarden/222-pause-stopp-skjul-niva/101) Pause, stopp, skjul (A) | Kartlegg automatisk bevegelse og oppdateringer. Kontroller mulighet til å pause, stoppe, skjule eller styre oppdateringen der kravet gjelder. | Ikke vurdert |
| [2.3.1](https://www.uutilsynet.no/wcag-standarden/231-terskelverdi-pa-maksimalt-tre-glimt-niva/102) Terskelverdi på maksimalt tre glimt (A) | Undersøk animasjoner og blinkende innhold. Unngå blink; dersom det finnes, kontroller frekvens og terskelverdier etter testreglene. | Ikke vurdert |
| [2.4.1](https://www.uutilsynet.no/wcag-standarden/241-hoppe-over-blokker-niva/103) Hoppe over blokker (A) | Test at gjentatt navigasjon kan hoppes over. Kontroller hoppelenke og målet i hovedinnholdet på sider med dekoratør. | Ikke vurdert |
| [2.4.2](https://www.uutilsynet.no/wcag-standarden/242-sidetitler-niva/104) Sidetitler (A) | Kontroller nettleserens tittel ved direkte inngang, stegbytte, visning, feil og kvittering. Tittelen skal beskrive sidens tema eller formål. | Ikke vurdert |
| [2.4.3](https://www.uutilsynet.no/wcag-standarden/243-fokusrekkefolge-niva/105) Fokusrekkefølge (A) | Følg fokus gjennom stegbytter, feil, dynamiske felt og sletting. Rekkefølgen skal bevare mening og betjening. Følg opp F03 med faktisk tastatur- og skjermlesertest. | Ikke vurdert |
| [2.4.4](https://www.uutilsynet.no/wcag-standarden/244-formal-med-lenke-i-kontekst-niva/106) Formål med lenke, i kontekst (A) | Undersøk lenketekst og programmatisk bestemt kontekst. Kontroller særlig gjentatte endringslenker, avbryt og lenker til veiledning. | Ikke vurdert |
| [2.4.5](https://www.uutilsynet.no/wcag-standarden/245-flere-mater-niva-aa/107) Flere måter (AA) | Kontroller flere måter å finne sider i et sett av nettsider. Vurder unntaket for sider som er resultat av eller steg i en prosess; ikke bruk unntaket automatisk på hele tjenesten. | Ikke vurdert |
| [2.4.6](https://www.uutilsynet.no/wcag-standarden/246-overskrifter-og-ledetekster-niva-aa/108) Overskrifter og ledetekster (AA) | Les overskrifter og feltnavn samlet. Kontroller at de beskriver tema eller formål og skiller like felt og gjentatte grupper fra hverandre. | Ikke vurdert |
| [2.4.7](https://www.uutilsynet.no/wcag-standarden/247-synlig-fokus-niva-aa/109) Synlig fokus (AA) | Gå gjennom alle kontroller med tastatur. Kontroller synlig fokus på ulike bakgrunner og i åpne komponenter og feilsituasjoner. | Ikke vurdert |
| [2.5.1](https://www.uutilsynet.no/wcag-standarden/251-pekerbevegelser-niva/148) Pekerbevegelser (A) | Kontroller at funksjoner kan brukes med enkel pekerinput uten flerpunkts- eller banebaserte bevegelser, med mindre bevegelsen er nødvendig. | Ikke vurdert |
| [2.5.2](https://www.uutilsynet.no/wcag-standarden/252-pekeravbrytelse-niva/149) Pekeravbrytelse (A) | Test trykk, hold, flytt pekeren bort og slipp på relevante kontroller. Kontroller at handlinger følger kravets alternativer for avbrytelse eller angring. | Ikke vurdert |
| [2.5.3](https://www.uutilsynet.no/wcag-standarden/253-ledetekst-i-navn-niva/150) Ledetekst i navn (A) | Sammenlign synlig ledetekst med tilgjengelig navn ved tom, forhåndsutfylt, endret og ugyldig verdi. Navnet skal inneholde den synlige teksten i riktig rekkefølge. Kontroller inntekt, refusjonsbeløp og naturalytelser med skjermleser og stemmestyring. | Ikke vurdert |
| [2.5.4](https://www.uutilsynet.no/wcag-standarden/254-bevegelsesaktivering-niva/151) Bevegelsesaktivering (A) | Undersøk eventuell betjening gjennom bevegelse av enheten eller brukeren. Kontroller alternativ betjening og mulighet til å slå av bevegelsesaktivering etter kravets vilkår. | Ikke vurdert |

### Forståelig

| Krav | Hva vi skal kontrollere og hvordan | Status |
| --- | --- | --- |
| [3.1.1](https://www.uutilsynet.no/wcag-standarden/311-sprak-pa-siden-niva/110) Språk på siden (A) | Kontroller gyldig og riktig `lang` på dokumentet, også når serveren legger til dekoratør og viser feilsider. | Ikke vurdert |
| [3.1.2](https://www.uutilsynet.no/wcag-standarden/312-sprak-pa-deler-av-innhold-niva-aa/111) Språk på deler av innhold (AA) | Finn fremmedspråklige avsnitt og fraser og kontroller språkmerking der kravet gjelder. Vurder unntak for blant annet egennavn og faguttrykk. | Ikke vurdert |
| [3.2.1](https://www.uutilsynet.no/wcag-standarden/321-fokus-niva/112) Fokus (A) | Flytt fokus til alle typer kontroller. Fokus alene skal ikke utløse uventet navigasjon, innsending eller annen kontekstendring. | Ikke vurdert |
| [3.2.2](https://www.uutilsynet.no/wcag-standarden/322-inndata-niva/114) Inndata (A) | Endre valg, beløp og datoer. Kontroller at endring av verdi ikke automatisk utløser kontekstendring uten at brukeren er varslet på forhånd. Vurder betinget innhold konkret. | Ikke vurdert |
| [3.2.3](https://www.uutilsynet.no/wcag-standarden/323-konsekvent-navigering-niva-aa/113) Konsekvent navigering (AA) | Sammenlign gjentatt navigasjon på tvers av sider, inkludert dekoratør og stegnavigasjon. Kontroller konsekvent innbyrdes rekkefølge. | Ikke vurdert |
| [3.2.4](https://www.uutilsynet.no/wcag-standarden/324-konsekvent-identifikasjon-niva-aa/115) Konsekvent identifikasjon (AA) | Sammenlign kontroller med samme funksjon på tvers av flytene. Kontroller konsekvente navn, ikoner og tekstalternativer. | Ikke vurdert |
| [3.3.1](https://www.uutilsynet.no/wcag-standarden/331-identifikasjon-av-feil-niva/116) Identifikasjon av feil (A) | Utløs hver type inndatafeil. Kontroller at feltet identifiseres og feilen beskrives med tekst, også for dynamiske felt og asynkron validering. | Ikke vurdert |
| [3.3.2](https://www.uutilsynet.no/wcag-standarden/332-ledetekster-eller-instruksjoner-niva/117) Ledetekster eller instruksjoner (A) | Kontroller synlige ledetekster, obligatoriske opplysninger, enheter og nødvendige formatinstruksjoner før brukeren fyller ut. | Ikke vurdert |
| [3.3.3](https://www.uutilsynet.no/wcag-standarden/333-forslag-ved-feil-niva-aa/118) Forslag ved feil (AA) | Utløs kjente valideringsfeil. Kontroller at meldingene forklarer hvordan de kan rettes når rettingen er kjent, uten å røpe opplysninger som ikke skal vises. | Ikke vurdert |
| [3.3.4](https://www.uutilsynet.no/wcag-standarden/334-forhindring-av-feil-juridiske-feil-okonomiske-feil-datafeil-niva-aa/119) Forhindring av juridiske feil, økonomiske feil og datafeil (AA) | Kontroller at brukeren kan gjennomgå og rette relevante opplysninger før bindende innsending, eller at et annet tillatt alternativ oppfyller kravet. Test at oppsummeringen faktisk samsvarer med det som sendes. | Ikke vurdert |

### Robust

| Krav | Hva vi skal kontrollere og hvordan | Status |
| --- | --- | --- |
| [4.1.1](https://www.uutilsynet.no/wcag-standarden/411-parsing-oppdeling-niva/120) Parsing, oppdeling (A) | Undersøk ferdig rendret HTML for feil nesting, dupliserte attributter og ID-er etter tilsynets gjeldende testregler. Ikke anta at React eller bestått lint sikrer samsvar. | Ikke vurdert |
| [4.1.2](https://www.uutilsynet.no/wcag-standarden/412-navn-rolle-verdi-niva/121) Navn, rolle, verdi (A) | Undersøk tilgjengelighetstreet og test med skjermleser. Kontroller navn, roller, verdier og tilstander for felt, grupper, kalendere, ekspanderbart innhold og ikonknapper. | Ikke vurdert |
| [4.1.3](https://www.uutilsynet.no/wcag-standarden/413-statusbeskjeder-niva-aa/152) Statusbeskjeder (AA) | Utløs oppslag, lasting, feil, nye perioder og andre oppdateringer uten kontekstendring. Kontroller at relevante beskjeder kunngjøres uten unødvendig fokusflytting eller gjentakelser. | Ikke vurdert |

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

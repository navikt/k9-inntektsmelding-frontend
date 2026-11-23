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
| 1.3.5 Inndataformål | Riktige `autocomplete`-verdier i relevante felt. | Om opplysningene gjelder den som fyller ut. Ikke behandle den ansattes opplysninger som kontaktpersonens. |
| 1.4.1 Bruk av farge | At feil har tekst, valgt steg har tekst eller programmatisk tilstand, og endringer viser feltnavn og verdier. | Om all nødvendig informasjon fortsatt kan forstås uten farge. Suppler med visuell kontroll. |
| 1.4.3 Tekstkontrast | Axe og måling av kjente, faktisk rendrede fargepar i relevante tilstander. | Bakgrunner som verktøyet ikke kan avgjøre, og dokumenterte unntak. |
| 1.4.11 Ikke-tekstlig kontrast | Felleskontrollen måler avgrensningen til felt, radioknapper og avkrysningsbokser, valgt radioknapp, bryter og ikoner i kontroller. Den måler også fokusmarkering for alle elementer som kan få fokus. Fokusmarkering finnes ved å sammenligne stilen før og etter `focus({ focusVisible: true, preventScroll: true })` på elementet, barna og tre nivåer opp, også `::before` og `::after`. Fokushendelsene stoppes i capture-fasen, slik at målingen ikke utløser validering i appen. | Tilstander som ikke finnes ved sjekkpunktene, for eksempel valgt kalenderdag. Grafikk uten tekst, hover og om lesefelt skal regnes som aktive. |
| 1.4.4 Tekststørrelse | Ekte 200 % nettleserzoom, bevart synlig tekst, feltverdier og gjennomførbare handlinger. | Visuell klipping og overlapp. Vannrett rulling alene er ikke automatisk et brudd på 1.4.4. |
| 1.4.5 Bilder av tekst | Kartlegging av bilder, SVG, canvas og bildebakgrunner kan støtte kontrollen. | Om bildet formidler tekst som skulle vært vanlig tekst, og om et unntak gjelder. |
| 1.4.10 Reflow | 320 CSS-piksler, ekte 400 % zoom fra 1280 piksler, dokumentoverløp, interne vannrette rulleområder og betjening. | Informasjonstap, overlapp og reelle behov for todimensjonal layout. Datopar og skjemafelt er ikke automatisk unntatt. |
| 1.4.12 Tekstavstand | Felleskontrollen legger på alle fire verdiene samtidig og ser etter tekst som klippes av `overflow: hidden` eller `clip`, og tekstlinjer som overlapper. Tekst som er klippet av en forelder, for eksempel i lukkede kort, telles ikke. Tekst i dialoger, popovere og elementer med `position` og `z-index` sammenlignes bare med tekst i samme lag. Ved funn legges et skjermbilde ved. | Om funnet faktisk gir tap av informasjon eller funksjon. Vannrett rulling er ikke tap etter dette kravet. Det vurderes under 1.4.10. |
| 1.4.13 Ekstra innhold | Åpne med hover og fokus, lukk med Escape der det gjelder, og kontroller at innhold kan nås. | Om innholdet kan avvises, pekes på og forblir tilgjengelig i den konkrete situasjonen. |
| 2.1.1, 2.1.2 og 2.4.3 Tastatur og fokus | Tastaturhandlinger, fokusmål, fokusretur og kjente navigasjonssekvenser. | Hele prosesser, logisk fokusrekkefølge og fravær av feller med faktiske hjelpemidler. `.fill()` eller `.focus()` beviser ikke Tab-tilgang. |
| 2.4.2 Sidetitler | Én `<title>` og forventet tittel per rute ved hvert UU-sjekkpunkt, også etter navigering. Legg nye ruter inn i oversikten i felleskontrollene. Feilsider kontrolleres for seg. | Om tittelen beskriver sidens tema eller formål. Vurder ordlyden én gang før den legges inn som forventet tittel. |
| 3.1.1 og 3.1.2 Språk | `lang` på `<html>` og axe-reglene `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` og `valid-lang` på hele dokumentet. Den vanlige axe-skanningen dekker bare `main` og fanger ikke sidenivåregler. | Om sidespråket stemmer med innholdet, og om avsnitt på andre språk er merket. Egennavn og faguttrykk er unntatt. |
| 2.5.3, 3.3.1, 3.3.2, 4.1.2 og 4.1.3 Navn, feil og status | Synlig ledetekst i tilgjengelig navn, feilbeskrivelser, ARIA-tilstand og semantikk for statusmeldinger. | Om navn og rettingsråd er forståelige, og hva skjermleseren faktisk kunngjør. |

For krav uten relevant automatisk kontroll: beskriv en konkret manuell test. Fravær av en automatisk test er ikke «Ikke relevant».

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

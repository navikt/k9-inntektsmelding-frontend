import { BodyLong, Heading, HStack, Page } from "@navikt/ds-react";
import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <Page background="bg-subtle">
      <Breadcrumbs />
      <Page.Block className="bg-bg-default border-border-focus-on-inverted border-b-4 py-5">
        <Page.Block width="lg">
          <HStack align="center">
            <Illustration />
            <Heading className="ml-4" level="1" size="medium">
              Inntektsmelding – YTELSE
            </Heading>
          </HStack>
        </Page.Block>
      </Page.Block>
      <Page.Block
        className="bg-surface-info-subtle mt-10"
        gutters={true}
        width="lg"
      >
        <Heading className="p-6" level="2" size="medium">
          Ny inntektsmelding
        </Heading>
      </Page.Block>
      <Page.Block className="bg-bg-default py-4" gutters={true} width="lg">
        <BodyLong spacing>
          For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må
          dere bekrefte eller oppdatere opplysningene vi har om den ansatte og
          sykefraværet. Vi gjør dere oppmerksom på at den ansatte vil få tilgang
          til å se innsendt informasjon etter personopplysningslovens artikkel
          15 og forvaltningsloven § 18.
        </BodyLong>
        <BodyLong>
          Da dette sykefraværet er innenfor samme arbeidsgiverperiode som
          forrige sykefravær trenger vi bare informasjon om inntekt og refusjon.
        </BodyLong>
      </Page.Block>
    </Page>
  ),
});

const Breadcrumbs = () => {
  setBreadcrumbs([
    { title: "Min side arbeidsgiver", url: "/" },
    {
      title: "Inntektsmelding",
      url: "/inntektsmelding",
    },
  ]);
  return null;
};

const Illustration = () => (
  <svg
    aria-hidden="true"
    className="hidden sm:block ml-3"
    fill="none"
    height="52"
    role="img"
    viewBox="0 0 56 56"
    width="52"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M41.8696 28.3623C41.8696 21.1426 36.0168 15.2899 28.7971 15.2899L28.7971 19.4493L15.7246 11.7246L28.7971 4L28.7971 8.15943C39.9549 8.15943 49 17.2046 49 28.3623H41.8696ZM15.1304 28.3623C15.1304 35.5821 20.9832 41.4348 28.2029 41.4348L28.2029 37.2754L41.2754 45L28.2029 52.7246L28.2029 48.5652C17.0451 48.5652 8 39.5201 8 28.3623H15.1304Z"
      fill="#E6F0FF"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M12.9999 29V32H19.4647C19.7991 32 20.1113 32.1671 20.2968 32.4453L23.9999 38L20.2968 43.5547C20.1113 43.8329 19.7991 44 19.4647 44H12.9999V52H10.9999V44H0.934192C0.534844 44 0.296647 43.5549 0.518165 43.2227L3.99993 38L0.518165 32.7773C0.296647 32.4451 0.534843 32 0.934191 32H10.9999V29C10.9999 28.4477 11.4477 28 11.9999 28C12.5522 28 12.9999 28.4477 12.9999 29ZM3.73697 34L6.40363 38L3.73697 42H18.9296L21.5962 38L18.9296 34H3.73697Z"
      fill="#262626"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M17 7A5 5 0 1 1 7 7a5 5 0 0 1 10 0Zm2 0A7 7 0 1 1 5 7a7 7 0 0 1 14 0Zm-6 17v-5h-2v5l-2.778-8.334A11.011 11.011 0 0 0 1.182 24h2.041a9.012 9.012 0 0 1 3.829-5.52L8.892 24H13Zm7.777 0h2.042a11.011 11.011 0 0 0-7.041-8.334L13 24h2.108l1.84-5.52A9.012 9.012 0 0 1 20.777 24ZM13 16v2h-2v-2h2Z"
      fill="currentColor"
      fillRule="evenodd"
      transform="translate(27,4)"
    />
  </svg>
);

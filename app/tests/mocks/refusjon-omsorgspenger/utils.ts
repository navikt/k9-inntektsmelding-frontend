import { Page } from "@playwright/test";

import { InntektsopplysningerDto } from "~/features/refusjon-omsorgspenger/api/queries";

export const mockInnloggetBruker = ({
  page,
  json = {
    fornavn: "Test",
    etternavn: "Bruker",
    telefon: "12345678",
    organisasjonsnummer: "123456789",
    organisasjonsnavn: "Test Organisasjon",
  },
}: {
  page: Page;
  json?: {
    fornavn?: string;
    mellomnavn?: string;
    etternavn?: string;
    telefon?: string;
    organisasjonsnummer?: string;
    organisasjonsnavn?: string;
  };
}) => {
  return page.route(
    "**/*/server/api/refusjon-omsorgsdager/innlogget-bruker",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockArbeidstakerOppslag = ({
  page,
  json = {
    personinformasjon: {
      fornavn: "Test",
      etternavn: "Ansatt",
      fødselsnummer: "09876543210",
      aktørId: "1234567890123",
    },
    arbeidsforhold: [
      {
        organisasjonsnavn: "Test Organisasjon",
        organisasjonsnummer: "123456789",
      },
    ],
  },
}: {
  page: Page;
  json?: {
    personinformasjon: {
      fornavn: string;
      mellomnavn?: string;
      etternavn: string;
      fødselsnummer: string;
      aktørId: string;
    };
    arbeidsforhold: Array<{
      organisasjonsnavn: string;
      organisasjonsnummer: string;
    }>;
  };
}) => {
  return page.route(
    "**/*/server/api/refusjon-omsorgsdager/arbeidstaker",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockInntektsmeldingForÅr = ({
  page,
  json = [],
}: {
  page: Page;
  json?: unknown[];
}) => {
  return page.route(
    "**/*/imdialog/inntektsmeldinger-for-aar*",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockInntektsopplysninger = ({
  page,
  json = {
    gjennomsnittLønn: 50_000,
    månedsinntekter: [
      {
        fom: "2024-01-01",
        tom: "2024-01-31",
        beløp: 50_000,
        status: "BRUKT_I_GJENNOMSNITT" as const,
      },
    ],
  },
}: {
  page: Page;
  json?: {
    gjennomsnittLønn?: number;
    månedsinntekter?: Array<{
      fom: string;
      tom: string;
      beløp?: number;
      status:
        | "NEDETID_AINNTEKT"
        | "BRUKT_I_GJENNOMSNITT"
        | "IKKE_RAPPORTERT_MEN_BRUKT_I_GJENNOMSNITT"
        | "IKKE_RAPPORTERT_RAPPORTERINGSFRIST_IKKE_PASSERT";
    }>;
  };
}) => {
  return page.route(
    "**/*/refusjon-omsorgsdager/inntektsopplysninger",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockInntektsopplysningerIngenPenger = ({
  page,
}: {
  page: Page;
}) => {
  return page.route(
    "**/*/refusjon-omsorgsdager/inntektsopplysninger",
    async (route) => {
      await route.fulfill({
        json: {
          gjennomsnittLønn: 0,
          månedsinntekter: [],
        } satisfies InntektsopplysningerDto,
      });
    },
  );
};

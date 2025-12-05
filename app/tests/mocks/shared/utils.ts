import { expect, Locator, Page } from "@playwright/test";

import type { OpplysningerDto } from "~/types/api-models.ts";

import { arbeidsforholdResponse } from "../arbeidsgiverinitiert/nyansatt/arbeidsforhold.ts";
import {
  ingenEksisterendeInntektsmeldingerResponse,
  mangeEksisterendeInntektsmeldingerResponse,
} from "../inntektsmelding/eksisterende-inntektsmeldinger";
import { enkeltOpplysningerResponse } from "../inntektsmelding/opplysninger.ts";
import { grunnbeløpResponse } from "./grunnbeløp";

type mockOpplysningerParams = {
  page: Page;
  json?: OpplysningerDto;
  uuid?: string;
};

export const mockOpplysninger = ({
  page,
  json = enkeltOpplysningerResponse,
  uuid = "1",
}: mockOpplysningerParams) => {
  return page.route(
    `**/*/imdialog/opplysninger?foresporselUuid=${uuid}`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockHentPersonOgArbeidsforholdParams = {
  page: Page;
  json?: typeof arbeidsforholdResponse;
};
export const mockHentPersonOgArbeidsforhold = ({
  page,
  json = arbeidsforholdResponse,
}: MockHentPersonOgArbeidsforholdParams) => {
  return page.route(
    `**/*/arbeidsgiverinitiert/arbeidsforhold`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockGrunnbeløpParams = {
  page: Page;
  json?: typeof grunnbeløpResponse;
};
export const mockGrunnbeløp = ({
  page,
  json = grunnbeløpResponse,
}: MockGrunnbeløpParams) => {
  return page.route(
    "https://g.nav.no/api/v1/grunnbel%C3%B8p",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockInntektsmeldingerParams = {
  page: Page;
  json?: typeof mangeEksisterendeInntektsmeldingerResponse;
  uuid?: string;
};

export const mockInntektsmeldinger = ({
  page,
  json = ingenEksisterendeInntektsmeldingerResponse,
  uuid = "1",
}: MockInntektsmeldingerParams) => {
  return page.route(
    `**/*/imdialog/inntektsmeldinger?foresporselUuid=${uuid}`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const finnInputFraLabel = async ({
  page,
  nth = 0,
  labelText,
}: {
  page: Locator | Page;
  nth?: number;
  labelText: string;
}) => {
  const label = page.locator(`label:has-text("${labelText}")`).nth(nth);
  const inputId = await label.getAttribute("for");
  return page.locator(`#${inputId}`);
};

export const expectError = async ({
  page,
  label,
  nth = 0,
  error,
}: {
  page: Locator | Page;
  label: string;
  nth?: number;
  error: string;
}) => {
  await expect(
    page.getByText(label).nth(nth).locator("..").getByText(error),
  ).toBeVisible();
};

export const brukNoBreakSpaces = (s: string) => {
  return s.replaceAll(" ", "\u00A0");
};

type MockAGIOpplysningerParams = {
  page: Page;
  json?: OpplysningerDto;
};

export const mockAGIOpplysninger = ({
  page,
  json,
}: MockAGIOpplysningerParams) => {
  return page.route(`**/*/arbeidsgiverinitiert/opplysninger`, async (route) => {
    await route.fulfill({ json });
  });
};

type MockAGISendInntektsmeldingParams = {
  page: Page;
  json?: unknown;
};

export const mockAGISendInntektsmelding = ({
  page,
  json,
}: MockAGISendInntektsmeldingParams) => {
  return page.route(
    `**/*/imdialog/send-inntektsmelding/arbeidsgiverinitiert-nyansatt`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

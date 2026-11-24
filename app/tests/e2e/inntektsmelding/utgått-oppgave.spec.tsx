import { expect, test } from "@playwright/test";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

import { utgåttOpplysningerResponse } from "../../mocks/inntektsmelding/opplysninger.ts";

test("utgått oppgave skal vise egen side og hindre innsending av IM", async ({
  page,
}) => {
  await mockOpplysninger({ page, json: utgåttOpplysningerResponse });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1");

  await expect(
    page.getByRole("heading", { name: "Oppgaven er utgått" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gå til Min side – arbeidsgiver" }),
  ).toBeVisible();

  // Forsøk gå til en annen underside, og forvent samme resultat
  await page.goto("/k9-im-dialog/1/dine-opplysninger");

  await expect(
    page.getByRole("heading", { name: "Oppgaven er utgått" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gå til Min side – arbeidsgiver" }),
  ).toBeVisible();
});

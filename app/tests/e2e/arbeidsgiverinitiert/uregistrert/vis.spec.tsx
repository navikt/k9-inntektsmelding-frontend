import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { agiUregistrertSendInntektsmeldingResponse } from "tests/mocks/arbeidsgiverinitiert/uregistrert/agi-send-inntektsmelding";
import {
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

const FORESPORSEL_UUID = "agi-vis-test-uuid";

test.describe("AGI unntatt Aa-registeret – vis-rute", () => {
  test("Viser innsendt inntektsmelding fra loader", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: agiOpplysningerResponseUregistrert,
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: [agiUregistrertSendInntektsmeldingResponse],
    });

    await page.goto(
      `/k9-im-dialog/agi-unntatt-aaregister/${FORESPORSEL_UUID}/vis`,
    );

    await expect(
      page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
    ).toBeVisible();

    // Arbeidsgiver og den ansatte
    await expect(page.getByText("Arbeidsgiver og den ansatte")).toBeVisible();
    await expect(page.getByText("NAV").first()).toBeVisible();
    await expect(
      page.getByText("974652293", { exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText("Ola Nordmann").first()).toBeVisible();
    await expect(page.getByText("98 76 54 32").first()).toBeVisible();
    await expect(
      page.getByText("Momentan Trakt", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("098101 98874", { exact: false }),
    ).toBeVisible();

    // Første fraværsdag
    await expect(page.getByText(/1. april 2024/)).toBeVisible();

    // Månedslønn
    await expect(page.getByText("Beregnet månedslønn")).toBeVisible();
    await expect(
      page.getByText("45 000 kr", { exact: false }).first(),
    ).toBeVisible();

    // Utbetaling og refusjon
    await expect(
      page.getByText("Ja, likt beløp i hele perioden"),
    ).toBeVisible();
    await expect(
      page.getByText("Refusjonsbeløp per måned", { exact: false }),
    ).toBeVisible();

    // Naturalytelser
    await expect(page.getByText("Nei").first()).toBeVisible();

    await expect(page.getByText("Last ned inntektsmeldingen")).toBeVisible();
  });

  test("Skjuler endre-knapp når forespørsel er UTGÅTT", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: {
        ...agiOpplysningerResponseUregistrert,
        forespørselStatus: "UTGÅTT" as const,
      },
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: [agiUregistrertSendInntektsmeldingResponse],
    });

    await page.goto(
      `/k9-im-dialog/agi-unntatt-aaregister/${FORESPORSEL_UUID}/vis`,
    );

    await expect(
      page.getByText(
        "Du kan ikke endre inntektsmeldingen når oppgaven den er knyttet til er utgått",
        { exact: false },
      ),
    ).toBeVisible();
  });
});

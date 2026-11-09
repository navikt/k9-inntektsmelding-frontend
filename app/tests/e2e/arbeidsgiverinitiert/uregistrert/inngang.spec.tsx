import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseUregistrert } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  mockAGIOpplysningerUregistrert,
  mockHentArbeidsgiversOrganisasjoner,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("Inngang", () => {
  test("Velger virksomhet uten personnavn og validerer valget", async ({
    page,
  }) => {
    await mockHentArbeidsgiversOrganisasjoner({
      page,
      json: {
        organisasjoner: [
          {
            organisasjonsnavn: "Første virksomhet",
            organisasjonsnummer: "315786940",
          },
          {
            organisasjonsnavn: "Andre virksomhet",
            organisasjonsnummer: "999999999",
          },
        ],
      },
    });
    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await expect(page.getByText("Navn", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
    await expect(page.getByText("Må oppgis", { exact: true })).toBeVisible();
    await page
      .getByRole("combobox", { name: "Arbeidsgiver" })
      .fill("Andre virksomhet");
    await page
      .getByRole("option", { name: "Andre virksomhet (999999999)" })
      .click();
    const opplysningerRequest = page.waitForRequest(
      "**/arbeidsgiverinitiert/opplysninger/uregistrert",
    );
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
    const forespørsel = await opplysningerRequest;
    expect(forespørsel.postDataJSON()).toEqual({
      fødselsnummer: FAKE_FNR,
      førsteFraværsdag: "2024-04-01",
      organisasjonsnummer: "999999999",
      ytelseType: "PLEIEPENGER_SYKT_BARN",
    });
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });

  for (const respons of [{ organisasjoner: [] }, { uventet: true }]) {
    test(`Viser feil ved organisasjonsrespons ${JSON.stringify(respons)}`, async ({
      page,
    }) => {
      await page.route(
        "**/arbeidsgiverinitiert/arbeidsgiver/organisasjoner",
        (route) => route.fulfill({ json: respons }),
      );
      await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
      await page
        .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
        .click();
      await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
      await page.getByLabel("Første fraværsdag").fill("01.04.2024");
      await page.getByRole("button", { name: "Hent opplysninger" }).click();
      await expect(page.getByRole("alert")).toContainText(
        "Kunne ikke hente virksomheter",
      );
      await expect(
        page.getByRole("button", { name: "Hent opplysninger" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "Opprett inntektsmelding" }),
      ).toHaveCount(0);
    });
  }

  test("should be able to navigate to the inngang page", async ({ page }) => {
    await mockHentArbeidsgiversOrganisasjoner({ page });
    await mockAGIOpplysningerUregistrert({
      page,
      json: agiOpplysningerResponseUregistrert,
    });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: "Unntatt registrering i Aa-registeret" })
      .click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await expect(page.getByText("Navn", { exact: true })).toHaveCount(0);
    const organisasjonerRespons = page.waitForResponse(
      "**/arbeidsgiverinitiert/arbeidsgiver/organisasjoner",
    );
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    const respons = await organisasjonerRespons;
    expect(respons.request().method()).toBe("GET");

    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });
});

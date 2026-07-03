import { Page } from "@playwright/test";

/**
 * Velger et alternativ fra en Combobox (UNSAFE_Combobox) ved å søke og klikke
 * på riktig alternativ i nedtrekkslisten.
 */
export async function velgFraCombobox({
  page,
  testId,
  søketekst,
  alternativNavn,
}: {
  page: Page;
  testId: string;
  søketekst: string;
  alternativNavn: string | RegExp;
}) {
  const combobox = page.getByTestId(testId);
  await combobox.click();
  await combobox.fill(søketekst);

  await page
    .getByRole("listbox")
    .getByRole("option", { name: alternativNavn })
    .click();
}

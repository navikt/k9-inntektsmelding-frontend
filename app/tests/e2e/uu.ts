import AxeBuilder from "@axe-core/playwright";
import { expect, Page, test } from "@playwright/test";

export const sjekkUniversellUtforming = async (page: Page, steg: string) => {
  await test.step(`Axe: ${steg}`, async () => {
    await expect(page.getByRole("main")).toBeVisible();

    const { violations, incomplete, testEngine, url, timestamp } =
      await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

    await test.info().attach(`axe-${steg}`, {
      body: JSON.stringify(
        { testEngine, url, timestamp, violations, incomplete },
        null,
        2,
      ),
      contentType: "application/json",
    });

    const avvik = violations.map(({ id, help, nodes }) => ({
      regel: id,
      beskrivelse: help,
      elementer: nodes.map(({ target }) => target),
    }));
    expect.soft(avvik, `WCAG-avvik i ${steg}`).toEqual([]);
  });
};

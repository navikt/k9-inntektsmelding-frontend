import AxeBuilder from "@axe-core/playwright";
import { expect, Page, test } from "@playwright/test";

export const sjekkUniversellUtforming = async (page: Page, steg: string) => {
  await test.step(`Axe: ${steg}`, async () => {
    await expect(page.getByRole("main")).toBeVisible();

    const overskrifter = await page
      .getByRole("main")
      .getByRole("heading")
      .evaluateAll((elementer) =>
        elementer.map((element) => ({
          nivå: Number(
            element.getAttribute("aria-level") ?? element.tagName.slice(1),
          ),
          tekst: element.textContent,
        })),
      );
    expect
      .soft(
        overskrifter.filter(({ nivå }) => nivå === 1),
        `Én hovedoverskrift i ${steg}`,
      )
      .toHaveLength(1);
    const hoppIOverskriftsnivå = overskrifter.filter(
      ({ nivå }, indeks) => nivå > (overskrifter[indeks - 1]?.nivå ?? 0) + 1,
    );
    expect
      .soft(hoppIOverskriftsnivå, `Overskriftshierarki i ${steg}`)
      .toEqual([]);

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

import { describe, expect, it } from "vitest";

// WCAG 2.5.1, 2.5.2 og 2.5.4: Appen skal ikke reagere på bevegelser, trykk ned eller sensorer.
// Bruker koden slike hendelser, må funksjonen også kunne brukes med et vanlig klikk, og testene må oppdateres.
const kildefiler = import.meta.glob<string>(
  ["./**/*.ts", "./**/*.tsx", "!./**/*.spec.ts"],
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);

const forbudteHendelser = [
  {
    krav: "2.5.1 Pekerbevegelser",
    mønster:
      /onTouchMove|touchmove|onPointerMove|pointermove|gesture(start|change|end)/i,
  },
  {
    krav: "2.5.2 Pekeravbrytelse",
    mønster:
      /onMouseDown|onPointerDown|onTouchStart|["'](mousedown|pointerdown|touchstart)["']/,
  },
  {
    krav: "2.5.4 Bevegelsesaktivering",
    mønster:
      /devicemotion|deviceorientation|DeviceMotionEvent|DeviceOrientationEvent/i,
  },
];

describe("Peker og bevegelse", () => {
  it.each(forbudteHendelser)(
    "$krav: koden bruker ikke hendelsene",
    ({ mønster }) => {
      const treff = Object.entries(kildefiler)
        .filter(([, innhold]) => mønster.test(innhold))
        .map(([fil]) => fil);
      expect(treff).toEqual([]);
    },
  );
});

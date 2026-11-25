import { useEffect } from "react";

const bruker = { harGjortNoe: false };
const registrerHandling = () => {
  bruker.harGjortNoe = true;
};
addEventListener("click", registrerHandling, { capture: true, once: true });
addEventListener("keydown", registrerHandling, { capture: true, once: true });

/**
 * Ruller til toppen og flytter fokus til overskriften for steget, slik at tastatur- og skjermleserbrukere
 * starter i det nye steget. Før brukeren har gjort noe, beholder nettleseren fokus øverst, slik at
 * dekoratørens «Hopp til hovedinnhold» er første stopp når siden lastes.
 */
export const useStartPåNyttSteg = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!bruker.harGjortNoe) {
      return;
    }
    const overskrift = document.querySelector<HTMLElement>("main h2");
    if (!overskrift) {
      return;
    }
    overskrift.tabIndex = -1;
    // Overskriften kan ikke betjenes, så den trenger ikke fokusmarkering.
    overskrift.classList.add("focus:outline-none");
    overskrift.focus({ preventScroll: true });
  }, []);
};

import { formatStrengTilTall } from "./utils";

export const UGYLDIG_DATO_FEILMELDING =
  "Datoen er ikke gyldig. Skriv den som dd.mm.åååå, for eksempel 01.04.2024.";

export const validateInntekt = (
  v: string | number,
  min?: number,
  max?: number,
) => {
  const asNumber = formatStrengTilTall(v);
  if (Number.isNaN(asNumber)) {
    return "Må være et tall";
  }

  // Backend aksepterer tall med maks 20 siffer. Velger MAX_SAFE_INTEGER som grense for å være under 20 siffer
  if (asNumber > Number.MAX_SAFE_INTEGER) {
    return "Beløpet er for stort";
  }

  if (asNumber < (min ?? -Infinity)) {
    return `Beløpet må være ${min} eller høyere`;
  }

  if (asNumber > (max ?? Infinity)) {
    return `Beløpet må være ${max} eller lavere`;
  }

  return true;
};

export const validateTimer = (v: string | number) => {
  if (!v) {
    return "Du må oppgi antall timer";
  }
  if (Number.isNaN(Number(v))) {
    return "Antall timer må være et tall";
  }
  if (Number(v) < 0) {
    return "Antall timer må være 0 eller høyere";
  }
  if (Number(v) > 24) {
    return "Antall timer kan ikke være mer enn 24";
  }

  return true;
};

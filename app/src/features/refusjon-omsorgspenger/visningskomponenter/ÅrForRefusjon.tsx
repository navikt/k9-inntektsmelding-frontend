import { Radio, RadioGroup } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useEffect } from "react";

import { useSkjemaState } from "../SkjemaStateContext";

export const førsteApril = dayjs().month(3).date(1);
export const kanVelgeFjoråret = dayjs().isBefore(førsteApril);
export const iÅr = dayjs().year();
export const iFjor = iÅr - 1;
// Man kan kreve refusjon tre måneder tilbake i tid.
// Det betyr at man kan søke om refusjon for fjoråret frem til 1. april.
export const ÅrForRefusjon = () => {
  const { register, formState, setValue } = useSkjemaState();
  const { name: årForRefusjonName, ...årForRefusjonRadioGroupProps } =
    register("årForRefusjon");
  useEffect(() => {
    if (!kanVelgeFjoråret) {
      setValue("årForRefusjon", String(iÅr));
    }
  }, []);

  if (!kanVelgeFjoråret) {
    return null;
  }

  return (
    <RadioGroup
      error={formState.errors.årForRefusjon?.message}
      legend="Hvilket år søker dere refusjon for?"
      name={årForRefusjonName}
    >
      <Radio value={String(iFjor)} {...årForRefusjonRadioGroupProps}>
        {iFjor}
      </Radio>
      <Radio value={String(iÅr)} {...årForRefusjonRadioGroupProps}>
        {iÅr}
      </Radio>
    </RadioGroup>
  );
};

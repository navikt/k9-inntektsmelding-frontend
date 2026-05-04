import { PlusIcon, TrashIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  Button,
  Heading,
  HStack,
  Label,
  List,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useLocation } from "@tanstack/react-router";
import { useFieldArray, useFormContext } from "react-hook-form";

import { DatePickerWrapped } from "~/features/shared/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { validateTimer } from "~/validators";

import { HjelpetekstReadMore } from "../Hjelpetekst.tsx";
import { OmsorgspengerFravær } from "./omsorgspengerFraværSchema";

type Props = {
  overskrift: string;
  år?: number;
};

function utledDefaultMonth(år: number) {
  const iDag = new Date();
  if (år === iDag.getFullYear()) {
    return iDag;
  }
  return new Date(år, 11, 31);
}

export const FraværDelerAvDagenListeInput = ({ overskrift, år }: Props) => {
  const { control, register, formState, setValue, getValues } =
    useFormContext<
      Pick<OmsorgspengerFravær, "fraværDelerAvDagen" | "fraværHeleDager">
    >();
  const location = useLocation();
  const erAGIUnntattAaregister = location.pathname.startsWith(
    "/agi-unntatt-aaregister",
  );
  const { fields, append, remove } = useFieldArray({
    control,
    name: "fraværDelerAvDagen",
  });

  const defaultMonth = år === undefined ? undefined : utledDefaultMonth(år);

  return (
    <VStack gap="space-16">
      <Heading level="3" size="small">
        {overskrift}
      </Heading>
      {fields.map((felt, index) => (
        <HStack
          align="start"
          className="border-solid border-0 border-l-4 border-ax-bg-neutral-soft pl-4 py-2"
          gap="space-16"
          key={felt.id}
        >
          <DatePickerWrapped
            datepickerProps={{ defaultMonth }}
            label="Dato"
            name={`fraværDelerAvDagen.${index}.dato`}
            rules={{
              required: "Dato er påkrevd",
              validate: (dato: string) => {
                if (!dato) return true;
                const alleDager = getValues("fraværDelerAvDagen") as {
                  dato: string;
                  timer: string;
                }[];
                const duplikat = alleDager.some(
                  (d, i) => i !== index && d.dato === dato,
                );
                if (duplikat) return "Datoen er allerede oppgitt";
                if (!erAGIUnntattAaregister) return true;
                const fraværHeleDager = getValues("fraværHeleDager");
                const overlap = fraværHeleDager.some(
                  (periode) =>
                    periode.fom &&
                    periode.tom &&
                    dato >= periode.fom &&
                    dato <= periode.tom,
                );
                return overlap
                  ? "Fravær deler av dag må ikke overlappe med fravær hele dager"
                  : true;
              },
            }}
          />
          <TextField
            label="Timer fravær"
            {...register(`fraværDelerAvDagen.${index}.timer`, {
              validate: validateTimer,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                const valueWithoutCommas = value.replaceAll(",", ".");
                setValue(
                  `fraværDelerAvDagen.${index}.timer`,
                  valueWithoutCommas,
                );
              },
            })}
            error={
              formState.touchedFields?.fraværDelerAvDagen?.[index]?.timer &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generisk komponent
              (formState.errors?.fraværDelerAvDagen as any)?.[index]?.timer
                ?.message
            }
          />
          <div>
            <Button
              aria-label="Slett dag"
              className="md:mt-10"
              icon={<TrashIcon />}
              onClick={() => remove(index)}
              size="small"
              type="button"
              variant="tertiary"
            >
              Slett
            </Button>
          </div>
        </HStack>
      ))}
      {fields.length > 0 && (
        <>
          <BodyLong className="text-ax-text-neutral-subtle" size="small">
            Timer skal avrundes til nærmeste halve time og beregnes basert på en
            7,5 timers arbeidsdag. Hvis arbeidstakeren har en annen ordinær
            arbeidstid, må fraværet omregnes.
          </BodyLong>
          <HjelpetekstReadMore header="Eksempler på hvordan du oppgir og omregner arbeidstid">
            <Label>Eksempel 1:</Label>
            <BodyLong>
              Arbeidstaker jobber vanligvis 7,5 timer per dag og har vært borte
              en halv dag.
            </BodyLong>
            <Box marginBlock="space-16" asChild>
              <List data-aksel-migrated-v8>
                <List.Item className="my-8">
                  Fraværet utgjør 3,75 timer, som skal avrundes til nærmeste
                  halve time. Dette betyr at du oppgir 4 timer i
                  refusjonskravet. Ved flere halve dager kan det oppgis som 3,5
                  og 4 timer annenhver dag.
                </List.Item>
                <Label>Eksempel 2:</Label>
                <BodyLong>
                  Arbeidstaker jobber vanligvis 9 timer per dag og er borte i 4
                  av disse. Du deler da antall timer fravær på antall timer
                  arbeidstakeren skulle jobbet. Tallet du får ganger du med 7,5.
                </BodyLong>
                <List.Item className="my-8">
                  4 timer fravær / 9 timer arbeidstid = 0,44 × 7,5 = 3,33 timer,
                  som avrundes til 3,5 timer i refusjonskravet.
                </List.Item>
                <BodyLong>
                  Du kan regne på samme måte om ordinær arbeidstid er over eller
                  under 7,5 time.
                </BodyLong>
              </List>
            </Box>
          </HjelpetekstReadMore>
        </>
      )}
      <div>
        <Button
          icon={<PlusIcon />}
          onClick={() =>
            append({ dato: "", timer: "" }, { shouldFocus: false })
          }
          size="small"
          type="button"
          variant="secondary"
        >
          Legg til dag
        </Button>
      </div>
    </VStack>
  );
};

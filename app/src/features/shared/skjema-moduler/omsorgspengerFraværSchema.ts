import { z } from "zod";

export const FraværHeleDagSchema = z.object({
  fom: z.string(),
  tom: z.string(),
});

export const FraværDelerAvDagSchema = z.object({
  dato: z.string(),
  timer: z.string(),
});

export const OmsorgspengerFraværSchema = z.object({
  fraværHeleDager: z.array(FraværHeleDagSchema),
  fraværDelerAvDagen: z.array(FraværDelerAvDagSchema),
  dagerSomSkalTrekkes: z.array(FraværHeleDagSchema).optional(),
});

export type OmsorgspengerFravær = z.infer<typeof OmsorgspengerFraværSchema>;

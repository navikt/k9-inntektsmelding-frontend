export type FormType = {
  fødselsnummer: string;
  organisasjonsnummer: string;
  årsak: "ny_ansatt" | "unntatt_aaregister" | "annen_årsak" | "";
  førsteFraværsdag: string;
};

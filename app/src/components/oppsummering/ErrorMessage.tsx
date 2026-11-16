import { Alert } from "@navikt/ds-react";

export const ErrorMessage = ({ message }: { message?: string }) => {
  return message ? <Alert variant="error">{message}</Alert> : null;
};

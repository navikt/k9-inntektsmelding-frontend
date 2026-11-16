import { useEffect } from "react";

/**
Hook som setter tittelen på siden man er på.

@param title Tittelen på siden
*/
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

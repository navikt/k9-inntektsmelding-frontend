import { Detail, Heading } from "@navikt/ds-react";
import clsx from "clsx";
import { useId } from "react";

type InformasjonsseksjonProps = {
  kilde?: string;
  tittel: string;
  children: React.ReactNode;
  className?: string;
  overskriftsnivå?: "3" | "4";
};
export const Informasjonsseksjon = ({
  children,
  kilde,
  tittel,
  className,
  overskriftsnivå = "3",
}: InformasjonsseksjonProps) => {
  const tittelId = useId();

  return (
    <section
      aria-labelledby={tittelId}
      className={clsx(
        "bg-ax-bg-neutral-soft p-4 flex flex-col gap-4 rounded-md flex-1",
        className,
      )}
    >
      <div className="flex flex-col-reverse ax-md:flex-row align-start ax-md:justify-between ax-md:items-center gap-2">
        <Heading id={tittelId} level={overskriftsnivå} size="xsmall">
          {tittel}
        </Heading>
        {kilde && (
          <Detail className="uppercase flex items-center">{kilde}</Detail>
        )}
      </div>
      {children}
    </section>
  );
};

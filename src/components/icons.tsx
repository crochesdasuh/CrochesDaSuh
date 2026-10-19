import type { SVGProps } from "react";

/** Novelo com agulha de crochê — símbolo da logo "Ateliê da Suh". */
export function YarnMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <clipPath id="suh-novelo">
          <circle cx="30" cy="30" r="19" />
        </clipPath>
      </defs>
      {/* agulha atravessando o novelo */}
      <g stroke="#8A7A70" strokeLinecap="round">
        <path d="M9 55 53.5 8.5" strokeWidth="2.4" />
        <path d="M53.5 8.5c1.6-1.7 3.6-.2 2.4 1.4l-1.2 1.2" strokeWidth="2" />
      </g>
      <circle cx="30" cy="30" r="19" fill="#D97757" />
      <g
        clipPath="url(#suh-novelo)"
        stroke="#FBE7DE"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".85"
      >
        <path d="M9 22c9-8 21-10 33-8M10 27c10-8 23-11 36-9M12 32c10-8 24-11 37-9" />
        <path d="M30 13c10 7 16 19 14 35M25 14c10 8 15 20 13 36" />
        <path d="M12 40c10-4 22-2 34 4M14 45c10-4 20-2 30 4M18 49c8-3 16-2 22 2" />
      </g>
      {/* fio solto com laço */}
      <path
        d="M44 42c4 6 9 8 12 5s0-6-2-3.5 1 7 8 6.5"
        stroke="#E29578"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Logo "Ateliê da Suh • Feito com amor" na paleta do site. */
export function Logo({
  layout = "horizontal",
  className = "",
}: {
  layout?: "horizontal" | "stacked";
  className?: string;
}) {
  const stacked = layout === "stacked";
  return (
    <span
      className={`inline-flex items-center ${stacked ? "flex-col text-center" : "gap-2"} ${className}`}
    >
      <YarnMark className={stacked ? "size-16" : "size-11 sm:size-12"} />
      <span className="leading-none">
        <span
          className={`block font-script text-grafite ${stacked ? "-mt-1 text-[2.6rem]" : "text-[1.9rem] sm:text-[2.15rem]"}`}
        >
          Ateliê da Suh
        </span>
        <span
          className={`block font-sans font-semibold uppercase text-cafe ${stacked ? "mt-1 text-[11px] tracking-[0.32em]" : "-mt-0.5 text-[9px] tracking-[0.3em] sm:text-[10px]"}`}
        >
          Feito com amor
        </span>
      </span>
    </span>
  );
}

/** Lucide não traz mais logos de marcas; ícone do Instagram em traço fino. */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </svg>
  );
}

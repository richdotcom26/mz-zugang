import * as React from "react";

/** Kleine Linien-Icons (24er-Raster, erben Farbe und Größe über currentColor / className). */
function Icon({ children, className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconSettings = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M10.3 4.3a1.7 1.7 0 0 1 3.4 0 1.7 1.7 0 0 0 2.6 1.1 1.7 1.7 0 0 1 2.4 2.4 1.7 1.7 0 0 0 1 2.5 1.7 1.7 0 0 1 0 3.4 1.7 1.7 0 0 0-1 2.6 1.7 1.7 0 0 1-2.4 2.4 1.7 1.7 0 0 0-2.6 1 1.7 1.7 0 0 1-3.4 0 1.7 1.7 0 0 0-2.5-1 1.7 1.7 0 0 1-2.4-2.4 1.7 1.7 0 0 0-1.1-2.6 1.7 1.7 0 0 1 0-3.4 1.7 1.7 0 0 0 1.1-2.5 1.7 1.7 0 0 1 2.4-2.4 1.7 1.7 0 0 0 2.5-1.1z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
export const IconLogout = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
    <path d="M9 12h12l-3-3m0 6 3-3" />
  </Icon>
);
export const IconPlus = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m5 12 5 5L20 7" />
  </Icon>
);
export const IconChevronDown = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const IconChevronLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
);
export const IconStar = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m12 17.8-6.2 3.2 1.2-6.9-5-4.9 6.9-1 3.1-6.3 3.1 6.3 6.9 1-5 4.9 1.2 6.9z" />
  </Icon>
);
export const IconUser = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </Icon>
);
export const IconSearch = (p: React.SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="10" cy="10" r="7" />
    <path d="m21 21-6-6" />
  </Icon>
);

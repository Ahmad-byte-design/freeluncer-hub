import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** The Warrior mark: a shield with a blade-edge W cut into it. */
export function Logo({ size = 28, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Warrior"
      {...rest}
    >
      <path
        d="M32 4 L58 12 V31 C58 46 47 56 32 61 C17 56 6 46 6 31 V12 Z"
        fill="var(--wr-ember)"
      />
      <polyline
        points="17,21 25,43 32,27 39,43 47,21"
        fill="none"
        stroke="var(--wr-obsidian)"
        strokeWidth="5.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Chevron({ size = 16, ...rest }: IconProps) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M3.5 6L8 10.5 12.5 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.2 10.2L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.75M8 13.25V15M15 8h-1.75M2.75 8H1M12.95 3.05l-1.24 1.24M4.29 11.71l-1.24 1.24M12.95 12.95l-1.24-1.24M4.29 4.29L3.05 3.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M13.5 9.75A5.75 5.75 0 015.25 2.5 6 6 0 1013.5 9.75z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 2.5h-8v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M3 8.5l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 4.5h5M10 4.5h4M2 11.5h3M8 11.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <rect x="8.5" y="2.75" width="2.5" height="3.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5.5" y="9.75" width="2.5" height="3.5" stroke="currentColor" strokeWidth="1.5" />
    </Svg>
  );
}

/** Drawn as the registration bracket that sits in the corners of a specimen. */
export function RegistrationMark(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M1.5 5V1.5H5M11 1.5h3.5V5M14.5 11v3.5H11M5 14.5H1.5V11"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </Svg>
  );
}
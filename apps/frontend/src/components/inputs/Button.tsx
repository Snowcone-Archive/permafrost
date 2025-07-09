import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

const colors = {
  danger: {
    bg: "snowflake-bg-danger",
    fg: "snowflake-fg-danger",
  },
  warning: {
    bg: "snowflake-bg-warning",
    fg: "snowflake-fg-warning",
  },
  success: {
    bg: "snowflake-bg-success",
    fg: "snowflake-fg-success",
  },
  primary: {
    bg: "snowflake-bg-info",
    fg: "snowflake-fg-info",
  },
  secondary: {
    bg: "snowflake-bg-dim",
    fg: "snowflake-fg-dim",
  },
};

const shapes = {
  normal: "px-16 rounded-[0.625rem] h-14 text-xl",
  normalNoPadding: "px-2 rounded-[0.625rem] h-14 text-xl",

  square: "h-14 w-14 rounded-[0.625rem] text-xl",
  squareMedium: "h-10 w-10 rounded-[0.625rem] text-lg",

  squareSmall: "h-8 w-8 rounded-[0.5rem] text-lg",
  slim: "h-10 rounded-[0.5rem] px-5 text-lg",
  none: "",
};

const styles = {
  shaded: "bg-gradient-to-b from-[#0000] via-[#0002] to-[#0004]",
  flat: "",
};

interface Props {
  children?: ReactNode | string | ReactNode[];
  variant?: keyof typeof styles;
  shape?: keyof typeof shapes;
  color?: keyof typeof colors;
  background?: string;
  foreground?: string;
  shadow?: boolean;
  disableRaiseOnFocus?: boolean;
}

export default function Button({
  children,
  color = "primary",
  shape = "normal",
  variant = "shaded",
  background,
  foreground,
  shadow = false,
  ...attributes
}: Props &
  DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >) {
  return (
    <button
      {...attributes}
      style={{
        boxShadow:
          "0px 0px 0px 1px rgba(0, 0, 0, 0.25), var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
        ...attributes.style,
      }}
      className={`${
        attributes.disableRaiseOnFocus ? "" : "focus:shadow-xl"
      } outline-none flex items-center justify-center border-t-[1px] border-t-[#fff2] font-bold ${
        shapes[shape]
      } ${styles[variant]} ${
        background ? background : `bg-${colors[color].bg}`
      } ${foreground ? foreground : `text-${colors[color].fg}`} ${
        attributes.className
      } hover:brightness-125 focus:brightness-125 transition-all disabled:brightness-75`}
    >
      {children}
    </button>
  );
}

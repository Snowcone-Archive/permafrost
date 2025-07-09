import type { DetailedHTMLProps } from "react";

export type IconProps = {
  src: string;
  size?: keyof typeof sizes;
} & DetailedHTMLProps<React.HTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const sizes = {
  "2xs": "h-4 w-4",
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
  "2xl": "h-24 w-24",
};

export default function Icon({
  src,
  style,
  className,
  size = "md",
  ...props
}: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      className={`rounded-full aspect-square ${sizes[size]} ${className} bg-[#fff2] object-contain`}
      style={{ ...style }}
      alt=""
      {...props}
    />
  );
}

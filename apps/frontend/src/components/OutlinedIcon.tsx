import { type MaterialIconName } from "ts-material-icon-name-list";

export function OutlinedIcon({
  icon,
  className,
  ...props
}: {
  icon: MaterialIconName | string;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined select-none ${className || ""}`}
      {...props}
    >
      {icon}
    </span>
  );
}

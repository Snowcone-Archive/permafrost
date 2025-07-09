import { type ReactNode } from "react";

export default function DatapointArea({
  icon,
  title,
  children,
  className,
  ...props
}: {
  icon: ReactNode;
  title: string | ReactNode;
  children: string | ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "title">) {
  return (
    <section>
      <header
        className={`flex text-md items-center gap-1 text-snowflake-gray-1 ${className}`}
        {...props}
      >
        {icon}
        <h6 className="font-bold leading-4">{title}</h6>
      </header>
      <main>{children}</main>
    </section>
  );
}

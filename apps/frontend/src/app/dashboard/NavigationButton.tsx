"use client";

import { OutlinedIcon } from "@/components/OutlinedIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavButton({
  symbol,
  selected,
  children,
  path,
  className,
  hoverColorOverride,
  onClick,
}: {
  symbol: string;
  selected?: boolean;
  children: string;
  path?: string;
  className?: string;
  hoverColorOverride?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Link href={path || "#"}>
      <div
        className={`w-full flex flex-row gap-3 items-center sm:p-2 p-3 rounded-lg transition-colors duration-300 ${
          hoverColorOverride ? "" : "hover:bg-[#ffffff08]"
        } ${pathname === path ? "bg-snowflake-gray-3" : ""} ${className || ""}`}
        onClick={onClick}
      >
        <OutlinedIcon icon={symbol} />
        <span>{children}</span>
      </div>
    </Link>
  );
}

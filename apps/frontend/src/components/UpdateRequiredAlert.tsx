import Link from "next/link";
import { OutlinedIcon } from "./OutlinedIcon";
import type { ReactNode } from "react";

export default function UpdateRequiredAlert({
  content,
}: {
  content: ReactNode;
}) {
  return (
    <div className="flex flex-row bg-snowflake-bg-warning text-snowflake-fg-warning p-4 rounded-lg items-center gap-2">
      <div>
        <OutlinedIcon icon="warning" />
      </div>
      {content}
    </div>
  );
}

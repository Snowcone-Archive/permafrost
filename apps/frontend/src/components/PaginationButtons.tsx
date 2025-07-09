import type { HTMLAttributes } from "react";
import { OutlinedIcon } from "./OutlinedIcon";

export default function PaginationButtons(
  props: HTMLAttributes<HTMLDivElement> & {
    page: number;
    pages: number;
    setPage: (page: number) => void;
  }
) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => props.setPage(props.page - 1)}
        disabled={props.page === 0}
        className="text-white flex items-center justify-center rounded-full w-8 h-8 bg-snowflake-fg-info disabled:bg-snowflake-gray-2"
      >
        <OutlinedIcon icon="chevron_left" />
      </button>
      <span>
        {props.page + 1} / {props.pages}
      </span>
      <button
        onClick={() => props.setPage(props.page + 1)}
        disabled={props.page + 1 >= props.pages}
        className="text-white flex items-center justify-center rounded-full w-8 h-8 bg-snowflake-fg-info disabled:bg-snowflake-gray-2"
      >
        <OutlinedIcon icon="chevron_right" />
      </button>
    </div>
  );
}

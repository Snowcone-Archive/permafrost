import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export default function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      {...props}
      className={`border-collapse w-full rounded-md overflow-hidden ${
        props.className || ""
      }`}
    >
      {props.children}
    </table>
  );
}

export function HeaderRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...props} className={`bg-[#1a1d31] ${props.className || ""}`}>
      {props.children}
    </tr>
  );
}

export function HeaderCell(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={`text-left text-sm uppercase font-medium p-2 text-snowflake-gray-1 ${
        props.className || ""
      }`}
    >
      {props.children}
    </th>
  );
}

export function BodyRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      {...props}
      className={`bg-snowflake-gray-3 odd:bg-opacity-50 ${
        props.className || ""
      }`}
    >
      {props.children}
    </tr>
  );
}

export function BodyCell(props: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...props} className={`p-2 text-sm ${props.className || ""}`}>
      {props.children}
    </td>
  );
}

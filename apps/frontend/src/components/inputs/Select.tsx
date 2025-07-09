import { OutlinedIcon } from "@/components/OutlinedIcon";
import React, {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  useEffect,
  useState,
} from "react";

export default function Select({
  value,
  onChange,
  children,
  className,
  outerClassName,
  ...props
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
  outerClassName?: string;
  children:
    | React.ReactElement<HTMLOptionElement>
    | (React.ReactElement<HTMLOptionElement> | false | undefined)[]
    | undefined;
} & Omit<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  "onChange"
>) {
  const [selected, setSelected] = useState<
    React.ReactElement<HTMLOptionElement> | undefined
  >(undefined);
  const [dropdownShown, setDropdownShown] = useState(false);
  const [actualChildren, setActualChildren] = useState<
    React.ReactElement<HTMLOptionElement>[]
  >(
    children === undefined
      ? []
      : Array.isArray(children)
      ? children
          .filter((child) => child !== false && child !== undefined)
          .map((child) => child as React.ReactElement<HTMLOptionElement>)
      : [children]
  );

  useEffect(() => {
    if (value) {
      const selectedOption = actualChildren.find(
        (child) => child!.props.value === value
      );

      if (selectedOption) {
        setSelected(selectedOption);
      }
    }
  }, [value, actualChildren]);

  useEffect(() => {
    onChange?.(selected?.props.value);
  }, [selected, onChange]);

  return (
    <div className={`relative ${outerClassName}`}>
      <button
        className={`w-full bg-snowflake-gray-3 px-4 py-2 text-white border-solid border-[2px] border-[#232538] rounded-lg text-md text-left ${
          dropdownShown && "rounded-b-none border-b-[1px] mb-[1px]"
        } ${className}`}
        onClick={() => {
          setDropdownShown(!dropdownShown);
        }}
        {...props}
      >
        {(selected?.props.children as any) || (
          <span className="text-snowflake-gray-1">Select...</span>
        )}
      </button>
      <OutlinedIcon
        icon={dropdownShown ? "expand_less" : "expand_more"}
        className="absolute right-2 top-[50%] translate-y-[-50%] pointer-events-none"
      />
      {dropdownShown && (
        <div className="absolute w-full bg-snowflake-gray-3 border-solid border-[2px] border-[#232538] rounded-b-lg z-20 shadow-lg border-t-[1px]">
          {actualChildren.map((child) => {
            return (
              <button
                key={child.props.value}
                onClick={() => {
                  setDropdownShown(false);
                  setSelected(child);
                }}
                className="w-full px-4 py-2 text-white text-left"
              >
                {child.props.children as any}
              </button>
            );
          })}
          {actualChildren.length === 0 && (
            <div className="italic text-snowflake-gray-1 p-4 py-2">
              No options available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

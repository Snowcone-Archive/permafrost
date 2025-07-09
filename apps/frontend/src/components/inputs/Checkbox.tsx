import { OutlinedIcon } from "@/components/OutlinedIcon";
import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";

// TODO: remove label in favor of children
export default function Checkbox({
  label,
  children,
  checked,
  small,
  onChange,
  ...attributes
}: {
  label?: string | ReactNode;
  children?: string | ReactNode;
  checked?: boolean;
  small?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement & { checked: boolean }>
  ) => void;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  const [isChecked, setIsChecked] = useState(checked ?? false);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  return (
    <div className="flex items-center space-x-2 flex-shrink-0">
      {/*eslint-disable-next-line jsx-a11y/role-supports-aria-props*/}
      <button
        role="checkbox"
        aria-checked={isChecked}
        style={{
          boxShadow:
            "0px 0px 0px 1px rgba(0, 0, 0, 0.25), var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
          ...attributes.style,
        }}
        className={`w-${small ? "6" : "8"} h-${
          small ? "6" : "8"
        } bg-snowflake-bg-dim rounded-${
          small ? "md" : "lg"
        } border-t-[1px] border-t-[#fff2] flex items-center justify-center flex-shrink-0 ${
          isChecked ? "!bg-snowflake-fg-info" : ""
        } ${
          attributes.disabled
            ? "cursor-not-allowed brightness-75"
            : "cursor-pointer"
        }`}
        onClick={() => {
          setIsChecked(!isChecked);
          onChange?.({
            currentTarget: {
              checked: !isChecked,
              ariaChecked: !isChecked,
            } as any as HTMLInputElement,
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        {...attributes}
      >
        {isChecked && (
          <OutlinedIcon
            icon="check"
            className={small ? "!text-[1.25rem]" : `!text-[1.5rem]`}
          />
        )}
      </button>
      <span
        onClick={() => {
          setIsChecked(!isChecked);
          onChange?.({
            currentTarget: {
              checked: !isChecked,
              ariaChecked: !isChecked,
            } as any as HTMLInputElement,
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        className="cursor-default"
      >
        {label || children}
      </span>
    </div>
  );
}

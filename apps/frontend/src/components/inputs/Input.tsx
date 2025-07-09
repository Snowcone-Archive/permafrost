import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

interface Props {
  invalid?: boolean;
  disableRaiseOnFocus?: boolean;
  containerClassName?: string;
  showHideButton?: boolean;
  copyable?: boolean;
  onEnter?: () => void;
  setRef?: (ref: RefObject<HTMLInputElement>) => void;
  blurOnEnter?: boolean;
}

export default function Input(
  attributes: Props &
    Omit<
      DetailedHTMLProps<
        InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >,
      "ref"
    >
) {
  const notifications = useNotifications();
  const input = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    attributes.setRef?.(input);
  }, [input, attributes]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    onEnter,
    invalid,
    disableRaiseOnFocus,
    containerClassName,
    showHideButton,
    copyable,
    ...remaining
  } = attributes;

  return (
    <div className={`${containerClassName} w-full relative`}>
      <input
        ref={input}
        {...remaining}
        type={
          attributes.type === "password" && passwordVisible
            ? "text"
            : attributes.type
        }
        className={`w-full outline-none ${
          disableRaiseOnFocus ? "" : "focus:shadow-xl"
        } invalid:border-snowflake-fg-danger invalid:border-opacity-50 ${
          invalid
            ? "border-snowflake-fg-danger border-opacity-50"
            : "focus:border-snowflake-fg-info"
        } transition-all duration-300 ease-out bg-snowflake-gray-3 px-4 py-2 text-white border-solid border-[2px] border-[#232538] rounded-lg text-md ${
          attributes.className
        } ${showHideButton || copyable ? "pr-11" : ""} ${
          attributes.type === "password" && passwordVisible ? "font-mono" : ""
        }`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            attributes.onEnter?.();
            if (attributes.blurOnEnter) {
              input.current?.blur();
            }
          }

          attributes.onKeyDown?.(e);
        }}
      ></input>
      {showHideButton && (
        <button
          className="absolute right-3 top-[56%] translate-y-[-50%] flex text-snowflake-gray-1"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          {passwordVisible ? (
            <OutlinedIcon icon="visibility_off" />
          ) : (
            <OutlinedIcon icon="visibility" />
          )}
        </button>
      )}
      {copyable && (
        <button
          style={{
            ...attributes.style,
          }}
          className="absolute right-3 top-[50%] translate-y-[-50%] flex text-snowflake-gray-1"
          onClick={() => {
            try {
              input.current?.select();
              navigator.clipboard.writeText(input.current?.value || "");
              notifications.create({
                type: "info",
                text: "Copied to clipboard",
              });
            } catch (e) {
              notifications.create({
                type: "error",
                text: "Could not copy to clipboard",
              });
            }
          }}
        >
          <OutlinedIcon icon="content_copy" />
        </button>
      )}
    </div>
  );
}

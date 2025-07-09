import { useEffect, useState } from "react";

export default function Prompt({
  buttons,
  children,
  visible,
  className,
  onFullyHidden,
}: {
  buttons?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[] | string;
  visible: boolean;
  className?: string;
  onFullyHidden?: () => void;
}) {
  const [wantsVisible, setWantsVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [actuallyVisible, setActuallyVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setWantsVisible(true);
    } else {
      setWantsVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!wantsVisible) {
      setTransitioning(false);
      setTimeout(() => {
        setActuallyVisible(false);
        if (onFullyHidden) {
          onFullyHidden();
        }
      }, 250);
    } else {
      setActuallyVisible(true);
      setTimeout(() => {
        setTransitioning(true);
      }, 50);
    }
  }, [wantsVisible, onFullyHidden]);

  return (
    <>
      {true && (
        <div
          className={`
            ${actuallyVisible ? "" : "hidden"}
            ${
              transitioning
                ? "bg-[#00000077] backdrop-blur-sm"
                : "bg-transparent backdrop-blur-0"
            }
            min-h-[100dvh] w-[100vw] fixed top-0 left-0 flex justify-center items-start transition-all duration-300 z-40 p-16
          `}
        >
          <div
            className={`
            ${
              transitioning
                ? "opacity-100 md:scale-100 translate-y-0"
                : "opacity-0 md:scale-95 md:translate-y-0 translate-y-[100%]"
            }
             bg-snowflake-bg-dark flex flex-col h-auto p-5 pb-safe-offset-5 rounded-xl shadow-md gap-4 transition-all duration-300 absolute bottom-0 w-full sm:max-w-96 rounded-b-none sm:static sm:rounded-b-xl ${className}`}
          >
            <div>{children}</div>
            <div
              className={`flex ${
                Array.isArray(buttons) && buttons.length >= 3
                  ? "flex-col !gap-2"
                  : "flex-row"
              } !md:flex-row gap-4 w-full md:justify-end items-stretch [&>button]:flex-grow [&>button]:md:flex-shrink`}
            >
              {buttons}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useEffect, useState } from "react";
import { NotificationEmitter } from "./NotificationManager";

export type NotificationProps = {
  text: string;
  type: string;
  persistent?: boolean;
};
export default function PermafrostNotification({
  emitter,
  message,
}: {
  emitter: NotificationEmitter;
  message: NotificationProps;
}) {
  const [messageRemoved, setMessageRemoved] = useState(false);
  const [type, setType] = useState(message.type);
  const [text, setText] = useState(message.text);

  useEffect(() => {
    emitter.on("remove", () => {
      setMessageRemoved(true);
    });

    emitter.on("update", (message: NotificationProps) => {
      setType(message.type);
      setText(message.text);
    });

    if (message.persistent) return;

    setTimeout(() => {
      setMessageRemoved(true);
      emitter.emit("goodbye");
    }, 2500);
  }, [emitter, message]);

  return (
    <div
      className={`inline-flex flex-row items-center gap-2 md:max-w-3xl max-w-[80%] p-4 px-6 rounded-xl shadow-xl w-auto flex-shrink ${
        messageRemoved && "translate-y-[-50%] opacity-0"
      } ${
        type === "success"
          ? "text-snowflake-fg-success bg-snowflake-bg-success"
          : type === "error"
          ? "text-snowflake-fg-danger bg-snowflake-bg-danger"
          : type === "warning"
          ? "text-snowflake-fg-warning bg-snowflake-bg-warning"
          : type === "info"
          ? "text-snowflake-fg-info bg-snowflake-bg-info"
          : ""
      }`}
      style={{
        transition: "opacity 0.5s, transform 0.5s",
      }}
    >
      {type === "success" ? (
        <OutlinedIcon icon="check" />
      ) : type === "error" ? (
        <OutlinedIcon icon="error" />
      ) : type === "warning" ? (
        <OutlinedIcon icon="warning" />
      ) : (
        <OutlinedIcon icon="info" />
      )}
      <div>{text}</div>
    </div>
  );
}

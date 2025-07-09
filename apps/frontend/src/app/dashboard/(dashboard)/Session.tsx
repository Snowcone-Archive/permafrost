import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { GetUserResponse } from "@snowflake-software/permafrost-js";
import { useState } from "react";
import Timeago from "react-timeago";
import { useSWRConfig } from "swr";
import { twMerge } from "tailwind-merge";

const getIconName = (
  iconName: GetUserResponse["sessions"][number]["device"]
) => {
  switch (iconName) {
    case "windows":
    case "mac":
    case "linux":
      return "desktop_windows";
    case "ios":
    case "android":
      return "phone_android";
    default:
      return "device_unknown";
  }
};

const getSessionTypeName = (
  device: GetUserResponse["sessions"][number]["device"]
) => {
  switch (device) {
    case "ios":
      return "iOS";
    case "sdk":
      return "SDK";
    case "mac":
      return "MacOS";
    default:
      return device[0].toUpperCase() + device.slice(1);
  }
};

export default function Session({
  session,
}: {
  session: GetUserResponse["sessions"][number];
}) {
  const [isHovered, setIsHovered] = useState(false);

  const { mutate } = useSWRConfig();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const deleteSession = () => {
    permafrost.users.sessions
      .delete(session.id)
      .catch((e) => notifications.fromError(e))
      .then(() => {
        mutate("users-me");
        notifications.create({
          type: "success",
          text: "Session deleted",
        });
      });
  };

  const displayClose = isHovered && session.id !== permafrost.auth.session?.id;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-row items-center justify-between"
    >
      <div key={session.id} className="flex flex-row gap-3 items-center">
        <span className="bg-[#4B4D69] rounded-full items-center flex flex-shrink-0 justify-center w-12 h-12 bg-gradient-to-b from-transparent via-transparent to-black/25 border-t border-white/20">
          <OutlinedIcon icon={getIconName(session.device)} />
        </span>
        <div className="flex-shrink">
          <h3 className="text-xl font-bold leading-4">
            {getSessionTypeName(session.device)}
          </h3>
          <div className="text-sm leading-4 text-snowflake-gray-1 pt-1">
            {session.id === permafrost.auth.session?.id ? (
              <span className="text-snowflake-fg-success leading-3">
                this device
              </span>
            ) : (
              <span>
                <Timeago date={session.lastActivity} />
              </span>
            )}
            {session.location && (
              <span>
                <span className="text-[#5c5f7c]"> • </span>
                {session.location.city}, {session.location.region},{" "}
                {session.location.country}
              </span>
            )}
            {session.authenticationMethod && (
              <span>
                <span className="text-[#5c5f7c]"> • </span>
                via{" "}
                {session.authenticationMethod === "Email"
                  ? "e-mail & password"
                  : session.authenticationMethod}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={deleteSession}
        className={twMerge(
          "text-snowflake-fg-danger transition-opacity",
          displayClose ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <OutlinedIcon icon="close" />
      </button>
    </div>
  );
}

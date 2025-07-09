import ApplicationIcon from "@/components/icons/ApplicationIcon";
import type { GetUserResponse } from "@snowflake-software/permafrost-js";
import TimeAgo from "react-timeago";

const getPermission = (permission: string) => {
  switch (permission) {
    case "profile":
      return "public data";
    case "email":
      return "private data";
    default:
      return permission;
  }
};

export default function Application({
  application,
}: {
  application: GetUserResponse["authorizations"][number];
}) {
  return (
    <div
      onMouseEnter={() => {} /*setIsHovered(true)*/}
      onMouseLeave={() => {} /*setIsHovered(false)*/}
      className="flex flex-row items-center justify-between"
    >
      <div className="flex flex-row gap-3 items-center">
        <span className="flex-shrink-0">
          <ApplicationIcon
            id={application.application.id}
            className="flex-shrink-0"
          />
        </span>
        <div>
          <h3 className="text-xl font-bold leading-4">
            {application.application.name}
          </h3>
          <div className="text-sm leading-4 text-snowflake-gray-1 pt-1">
            <span>
              <TimeAgo date={application.createdAt} />
              <span>
                <span className="text-[#5c5f7c]"> • </span>
                {application.scopes.map(getPermission).join(", ")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

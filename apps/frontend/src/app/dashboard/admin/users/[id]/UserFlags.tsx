import { OutlinedIcon } from "@/components/OutlinedIcon";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type {
  AccountPermissions,
  UserPrimitive,
} from "@snowflake-software/permafrost-js";

export default function UserFlag({
  user,
  excludeYou,
}: {
  user: UserPrimitive & { permissions: AccountPermissions[] };
  excludeYou?: boolean;
}) {
  const permafrost = usePermafrost();

  return (
    <div className="hidden flex-row gap-2 lg:flex">
      {user.id === permafrost.auth.user?.id && !excludeYou && (
        <div className="flex gap-1 items-center bg-snowflake-gray-4 text-snowflake-fg-dim py-1 px-3 rounded-full flex-row text-sm">
          You
        </div>
      )}
      {user.permissions.includes("Administrator") && (
        <div className="flex gap-1 items-center bg-[#FF4F7944] text-[#FF4F79] py-1 px-3 rounded-full flex-row text-sm">
          <OutlinedIcon
            icon="security"
            className="w-5 h-5 text-xl translate-y-[-20%]"
          />{" "}
          Admin
        </div>
      )}
    </div>
  );
}

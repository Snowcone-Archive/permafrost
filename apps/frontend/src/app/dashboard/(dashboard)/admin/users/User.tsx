import UserFlag from "@/app/dashboard/admin/users/[id]/UserFlags";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { AdminAllUsersResponse } from "@snowflake-software/permafrost-js";
import Link from "next/link";

export default function User({
  user,
}: {
  user: AdminAllUsersResponse["users"][number];
}) {
  const permafrost = usePermafrost();

  return (
    <div className="bg-snowflake-gray-3 p-4 rounded-xl flex gap-2 flex-col">
      <section className="flex justify-between items-center">
        <section className="flex flex-row gap-3 items-center w-full pr-3">
          <ProfilePicture id={user.id} size="lg" />
          <div className="w-full overflow-x-clip">
            <h1 className="text-3xl font-bold leading-7 max-w-full overflow-x-clip text-ellipsis whitespace-nowrap">
              {user.displayName}
            </h1>
            <h3 className="text-snowflake-gray-1 leading-4 w-full text-ellipsis whitespace-nowrap">
              @{user.username}
            </h3>
          </div>
          <UserFlag user={user} />
        </section>
        <div className="relative">
          <Link
            href="/dashboard/admin/users/[id]/account"
            as={`/dashboard/admin/users/${user.id}/account`}
          >
            <Button
              variant="flat"
              shape="none"
              color="secondary"
              className="w-10 h-10 rounded-lg"
              onClick={() => {
                //setShowContextMenu(!showContextMenu);
              }}
            >
              <OutlinedIcon icon="settings" />
            </Button>
          </Link>
          {/*
          <ConfigurePopout
            visible={showContextMenu}
            setVisible={setShowContextMenu}
            app={app}
            mutate={mutate}
          />*/}
        </div>
      </section>
    </div>
  );
}

import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import type { UserPrimitive } from "@snowflake-software/permafrost-js";

export default function BasicUserCard({
  user,
  deleteFunc,
}: {
  user: UserPrimitive;
  deleteFunc?: () => void;
}) {
  return (
    <div className="bg-snowflake-gray-3 p-4 rounded-lg flex gap-2 flex-col mt-2">
      <section className="flex justify-between items-center">
        <section className="flex flex-row gap-3 items-center">
          <ProfilePicture id={user.id} size="lg" />
          <div>
            <h1 className="text-3xl font-bold leading-7">{user.displayName}</h1>
            <h3 className="text-snowflake-gray-1 leading-4">
              @{user.username}
            </h3>
          </div>
        </section>
        <div>
          {deleteFunc && (
            <Button
              variant="flat"
              shape="none"
              color="danger"
              className="w-10 h-10 rounded-lg"
              onClick={deleteFunc}
            >
              <OutlinedIcon icon="delete" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

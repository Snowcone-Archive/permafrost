import { OutlinedIcon } from "@/components/OutlinedIcon";
import UserSearch from "@/components/UserSearch";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { type UserPrimitive } from "@snowflake-software/permafrost-js";
import { useEffect, useState } from "react";

export default function Collaborators({
  updateCollaborators,
  collaborators,
}: {
  updateCollaborators: (collaborators: UserPrimitive[]) => void;
  collaborators?: UserPrimitive[];
}) {
  const [hadCollaborators, setHadCollaborators] = useState<boolean>(false);
  const [appCollaborators, setAppCollaborators] = useState<UserPrimitive[]>([]);

  useEffect(() => {
    if (collaborators !== undefined && !hadCollaborators) {
      setAppCollaborators(collaborators);
      setHadCollaborators(true);
    }
  }, [collaborators, hadCollaborators]);

  useEffect(() => {
    updateCollaborators(appCollaborators);
  }, [appCollaborators, updateCollaborators]);

  return (
    <div className="flex flex-col gap-2">
      <UserSearch
        onUserSelect={(user) => {
          if (user && !appCollaborators.some((c) => c.id === user.id)) {
            setAppCollaborators([...appCollaborators, user]);
          }
        }}
        clearOnSelect
      />
      {appCollaborators.map((user) => (
        <div
          key={user.id}
          className="flex flex-row gap-2 items-center bg-snowflake-bg-dim p-4 rounded-lg mt-1 justify-between"
        >
          <div className="flex flex-row gap-4 items-center">
            <ProfilePicture id={user.id} size="lg" />
            <div>
              <div className="text-2xl font-bold leading-5">
                {user.displayName || `@${user.username}`}
              </div>
              {user.displayName && (
                <div className="opacity-50 text-sm leading-4">
                  @{user.username}
                </div>
              )}
            </div>
          </div>
          <Button
            shape="square"
            className="!h-10 !w-10"
            color="danger"
            variant="flat"
            onClick={() => {
              setAppCollaborators(
                appCollaborators.filter((c) => c.id !== user.id)
              );
            }}
          >
            <OutlinedIcon icon="delete" />
          </Button>
        </div>
      ))}
    </div>
  );
}

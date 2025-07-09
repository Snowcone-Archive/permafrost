import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import type { ListApplicationsResponse } from "@snowflake-software/permafrost-js";
import { useRouter } from "next/navigation";

export default function Application({
  app,
  hideOwner,
}: {
  app: ListApplicationsResponse["applications"][number];
  hideOwner?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="bg-snowflake-gray-3 p-4 rounded-lg flex gap-2 flex-col">
      <section className="flex sm:justify-between justify-center">
        <section className="flex flex-row gap-3 items-center">
          <ApplicationIcon id={app.id} size="lg" />
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold leading-8">{app.name}</h1>
            {hideOwner !== true && (
              <div className="leading-4 text-[#898dae]">
                Owned by{" "}
                <ProfilePicture
                  className="inline -block"
                  id={app.owner.id}
                  size="2xs"
                />{" "}
                {app.owner.displayName}{" "}
              </div>
            )}
          </div>
        </section>
        <div className="inline-flex items-center flex-row gap-2">
          <div className="relative">
            <Button
              variant="flat"
              shape="none"
              color="secondary"
              className="w-10 h-10 rounded-lg hidden sm:flex"
              onClick={() => {
                router.push(`/dashboard/admin/applications/${app.id}/profile`);
              }}
            >
              <OutlinedIcon icon="settings" />
            </Button>
          </div>
        </div>
      </section>
      <Button
        variant="flat"
        shape="slim"
        color="secondary"
        className="md:hidden"
        onClick={() => {
          router.push(`/dashboard/admin/applications/${app.id}/profile`);
        }}
      >
        Configure
      </Button>
      <section className="grid sm:grid-cols-2 gap-2">
        <DatapointArea
          title="Users"
          icon={<OutlinedIcon icon="group" className="text-xl" />}
        >
          {app.users} user{app.users === 1 ? "" : "s"}
        </DatapointArea>
        <DatapointArea
          title="Created"
          icon={<OutlinedIcon icon="calendar_month" className="text-xl" />}
        >
          {new Date(app.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </DatapointArea>
      </section>
    </div>
  );
}

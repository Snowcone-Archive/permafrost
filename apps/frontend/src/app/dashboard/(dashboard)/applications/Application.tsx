import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import Checkbox from "@/components/inputs/Checkbox";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import type { ListApplicationsResponse } from "@snowflake-software/permafrost-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import { useEffect, useState } from "react";

export default function Application({
  app,
}: {
  app: ListApplicationsResponse["applications"][number];
}) {
  const router = useRouter();
  const [showOauthGenerator, setShowOauthGenerator] = useState(false);
  const [readProfile, setReadProfile] = useState(false);
  const [readEmail, setReadEmail] = useState(false);
  const [oauthLink, setOauthLink] = useState("");
  const [redirectURI, setRedirectURI] = useState("");

  useEffect(() => {
    const scope = [];
    if (readEmail) scope.push("email");
    if (readProfile) scope.push("profile");

    setOauthLink(
      `${window.location.protocol}//${
        window.location.host
      }/authorize?client_id=${app.id}&scope=${scope.join(
        ","
      )}&redirect_uri=${escape(redirectURI)}`
    );
  }, [readProfile, readEmail, redirectURI, app.id]);

  return (
    <div className="bg-snowflake-gray-3 p-4 rounded-xl flex gap-2 flex-col">
      <section className="flex sm:justify-between justify-center">
        <section className="flex flex-row gap-3 items-center">
          <ApplicationIcon id={app.id} size="lg" />
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold leading-8">{app.name}</h1>
            {app.role !== "owner" && (
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
                router.push(`/dashboard/applications/${app.id}/profile`);
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
          router.push(`/dashboard/applications/${app.id}/profile`);
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
      <section>
        <DatapointArea
          title="Application ID"
          icon={<OutlinedIcon icon="sell" className="text-xl" />}
        >
          <Input
            value={app.id}
            readOnly
            copyable
            className="bg-snowflake-gray-3 mt-1"
          />
        </DatapointArea>
      </section>
      <DatapointArea
        title={
          <span>
            OAuth Generator{" "}
            <button
              className="text-white cursor-pointer"
              onClick={() => {
                setShowOauthGenerator(!showOauthGenerator);
              }}
            >
              {showOauthGenerator ? "hide" : "show"}
            </button>
          </span>
        }
        icon={<OutlinedIcon icon="deployed_code" className="text-xl" />}
      >
        {showOauthGenerator ? (
          <section className="bg-[#383B55] p-4 rounded-xl mt-1 flex flex-col gap-4">
            <DatapointArea
              title="Scopes"
              icon={<OutlinedIcon icon="beenhere" className="text-lg" />}
            >
              <section className="grid sm:grid-cols-2 gap-2">
                <Checkbox
                  label="Read public data"
                  onChange={(e) => {
                    setReadProfile(
                      e.currentTarget.ariaChecked as any as boolean
                    );
                  }}
                />
                <Checkbox
                  label="Read private data"
                  onChange={(e) => {
                    setReadEmail(e.currentTarget.ariaChecked as any as boolean);
                  }}
                />
              </section>
            </DatapointArea>

            <DatapointArea
              title="Redirect URI"
              icon={<OutlinedIcon icon="link" className="text-lg" />}
            >
              {app.redirectURIs.length === 0 ? (
                <p className="italic">
                  No redirect URIs are available. Please add one in the{" "}
                  <Link
                    href={`/dashboard/applications/${app.id}/integration`}
                    className="text-snowflake-fg-info hover:underline"
                  >
                    Integration tab
                  </Link>
                  .
                </p>
              ) : (
                <Select
                  onChange={(value) => {
                    if (!value) return;
                    setRedirectURI(value);
                  }}
                >
                  {app.redirectURIs.map((uri) => (
                    <option key={uri} value={uri}>
                      {uri}
                    </option>
                  ))}
                </Select>
              )}
            </DatapointArea>

            <Input
              value={oauthLink}
              readOnly
              copyable
              className="bg-[#383b55] mt-1"
            />
          </section>
        ) : (
          <></>
        )}
      </DatapointArea>
    </div>
  );
}

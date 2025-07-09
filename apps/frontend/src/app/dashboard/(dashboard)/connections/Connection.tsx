import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Prompt from "@/components/Prompt";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { AuthorizationsListResponse } from "@snowflake-software/permafrost-js";
import { useState } from "react";
import type { KeyedMutator } from "swr";

export default function Connection({
  authorization,
  mutate,
  data,
}: {
  authorization: AuthorizationsListResponse["authorizations"][number];
  mutate: KeyedMutator<AuthorizationsListResponse>;
  data: AuthorizationsListResponse;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [deauthorizePromptVisible, setDeauthorizePromptVisible] =
    useState<boolean>(false);

  const revokeAuthorization = () => {
    setDeauthorizePromptVisible(false);
    let didUnauthorize = true;

    notifications.create({
      type: "info",
      text: "Revoking application authorization...",
    });

    permafrost.authorizations
      .revoke(authorization.id)
      .then(() => {
        if (didUnauthorize) {
          mutate(
            {
              authorizations: data.authorizations!.filter(
                (item) => item.id !== authorization.id
              ),
            },
            false
          );
          notifications.create({
            type: "success",
            text: `Revoked authorization for ${authorization.application.name}.`,
          });
        }
      })
      .catch((err) => {
        didUnauthorize = false;
        notifications.fromError(err);
      });
  };

  return (
    <>
      {/* Begin Prompt */}
      <Prompt
        visible={deauthorizePromptVisible}
        buttons={
          <>
            <Button
              shape="slim"
              color="secondary"
              variant="flat"
              onClick={() => {
                setDeauthorizePromptVisible(false);
              }}
            >
              No
            </Button>
            <Button
              shape="slim"
              color="danger"
              variant="flat"
              onClick={revokeAuthorization}
            >
              Yes
            </Button>
          </>
        }
      >
        <h2 className="font-bold text-2xl">Confirmation</h2>
        <p>
          Are you sure you want to deauthorize &quot;
          {authorization?.application.name}&quot;?
        </p>
      </Prompt>
      {/* End Prompt */}

      <div className="bg-snowflake-gray-3 p-4 rounded-xl flex gap-3 flex-col">
        <header className="flex justify-center sm:justify-between items-center">
          <section className="flex flex-row gap-3 items-center">
            <ApplicationIcon id={authorization.application.id} size="lg" />
            <h1 className="text-3xl font-bold">
              {authorization.application.name}
            </h1>
          </section>
          <Button
            color="danger"
            shape="slim"
            variant="flat"
            className="hidden sm:flex"
            onClick={(e) => {
              if (e.shiftKey) return;
              setDeauthorizePromptVisible(true);
            }}
          >
            Deauthorize
          </Button>
        </header>
        <Button
          color="danger"
          shape="slim"
          variant="flat"
          className="show sm:hidden"
          onClick={(e) => {
            if (e.shiftKey) return;
            setDeauthorizePromptVisible(true);
          }}
        >
          Deauthorize
        </Button>
        <section className="grid sm:grid-cols-3 gap-2">
          <DatapointArea
            icon={<OutlinedIcon icon="calendar_month" className="text-lg" />}
            title="Authorized"
          >
            {new Date(authorization.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DatapointArea>
          <DatapointArea
            icon={<OutlinedIcon icon="group" className="text-lg" />}
            title="Total Users"
          >
            {authorization.application.authorizations} user
            {authorization.application.authorizations !== 1 ? "s" : ""}
          </DatapointArea>
          <DatapointArea
            icon={<OutlinedIcon icon="build" className="text-lg" />}
            title="Creator"
          >
            <div className={"flex flex-row gap-2 items-center"}>
              <ProfilePicture
                id={authorization.application.owner.id}
                size="xs"
              />

              <span>@{authorization.application.owner.username}</span>
            </div>
          </DatapointArea>
        </section>
        <DatapointArea
          icon={<OutlinedIcon icon="tune" className="text-lg" />}
          title="Scopes"
        >
          <section className="bg-[#383b55] lg:grid lg:grid-cols-2 flex flex-col gap-2 rounded-lg px-3 py-2 mt-1">
            {authorization.scopes.map((scope) => (
              <div key={scope} className="flex items-center gap-2">
                <span className="text-[#898DAE77]">•</span> {scope}
              </div>
            ))}
          </section>
        </DatapointArea>
      </div>
    </>
  );
}

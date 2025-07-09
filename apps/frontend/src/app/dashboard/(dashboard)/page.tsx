"use client";

import TextSkeleton from "@/components/skeletons/text";
import Link from "next/link";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import { usePermafrost } from "@/contexts/PermafrostContext";
import useSWR from "swr";
import UserFlag from "../admin/users/[id]/UserFlags";
import Loader from "@/components/Loader";
import Session from "./Session";
import Application from "./Application";
import UpdateRequiredAlert from "@/components/UpdateRequiredAlert";
import { useNotifications } from "@/contexts/NotificationContext";

export default function Dashboard() {
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const { data } = useSWR("users-me", async () => permafrost.users.get("me"));

  return data ? (
    <div className="flex flex-col gap-4">
      {permafrost.auth.user?.flags.includes("PendingEmailVerification") && (
        <UpdateRequiredAlert
          content={
            <p>
              Your new email has not yet been verified. Please check your email.
              If you need a new link, click{" "}
              <span
                className="hover:underline brightness-125 cursor-pointer"
                onClick={() => {
                  permafrost.users
                    .requestEmailVerification()
                    .then((response) => {
                      notifications.create({
                        type: "success",
                        text: "Verification email sent",
                      });
                    })
                    .catch((error) => {
                      notifications.fromError(error);
                    });
                }}
              >
                here
              </span>
              .
            </p>
          }
        />
      )}
      {permafrost.auth.user?.flags.includes("RequiresPasswordChange") && (
        <UpdateRequiredAlert
          content={
            <p>
              Your account does not have a password set. Please set a password{" "}
              <Link
                className="hover:underline brightness-125"
                href="/dashboard/account"
              >
                here
              </Link>
              .
            </p>
          }
        />
      )}
      <div className="flex flex-row gap-4 items-center bg-snowflake-gray-3 rounded-lg p-4">
        <ProfilePicture id={permafrost.auth.user?.id} size="xl" />
        <div className="flex justify-center flex-col">
          <div className="flex flex-row gap-2">
            <h1 className="text-3xl font-bold leading-8">
              {permafrost.auth.user !== undefined ? (
                permafrost.auth.user.displayName ||
                `@${permafrost.auth.user.username}`
              ) : (
                <TextSkeleton textSize="1.5rem" widthRange={[200, 300]} />
              )}
            </h1>
            <UserFlag user={data} excludeYou />
          </div>

          {permafrost.auth.user?.displayName && (
            <span className="leading-4 text-lg text-snowflake-gray-1">
              @
              {permafrost.auth.user ? (
                permafrost.auth.user.username
              ) : (
                <TextSkeleton
                  className="ml-1"
                  textSize="0.75rem"
                  widthRange={[200, 300]}
                />
              )}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-snowflake-gray-3 rounded-lg p-4">
        <h4 className="text-snowflake-gray-1 font-medium">
          Recent connections
        </h4>
        {(() => {
          const auths = data.authorizations
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

          return auths.length > 0 ? (
            auths.map((app) => <Application key={app.id} application={app} />)
          ) : (
            <span className="w-full text-snowflake-gray-1 bg-snowflake-gray-4 text-center text-sm rounded-md p-2">
              You haven&apos;t connected any apps recently
            </span>
          );
        })()}
      </div>

      <div className="flex flex-col gap-4 bg-snowflake-gray-3 rounded-lg p-4">
        <h4 className="text-snowflake-gray-1 font-medium">Sessions</h4>
        {data.sessions.filter(
          (s) => s.id === permafrost.auth.session!.id
        )[0] !== undefined && (
          <Session
            session={
              data.sessions.filter(
                (s) => s.id === permafrost.auth.session!.id
              )[0]
            }
          />
        )}
        {data.sessions
          .filter((i) => i.id !== permafrost.auth.session!.id)
          .sort(
            (a, b) =>
              new Date(b.lastActivity).getTime() -
              new Date(a.lastActivity).getTime()
          )
          .map((session) => {
            return <Session key={session.id} session={session} />;
          })}
      </div>
    </div>
  ) : (
    <Loader center />
  );
}

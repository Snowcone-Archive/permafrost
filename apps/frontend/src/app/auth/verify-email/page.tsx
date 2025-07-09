"use client";

import Button from "@/components/inputs/Button";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { browserStorage } from "@/utils/storage";
import useQuery from "@/utils/useQuery";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import useSWR from "swr";

export default function EmailVerificationRequired() {
  const permafrost = usePermafrost();
  const router = useRouter();
  const notifications = useNotifications();

  const [canResendAt, setCanResendAt] = useState<number | undefined>(undefined);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  const { data, isLoading, error } = useSWR("users-me", async () =>
    permafrost.users.get("me")
  );

  const { token } = useQuery();

  useEffect(() => {
    if (data === undefined) return;
    if (!data?.flags.includes("RequiresEmailVerification")) {
      router.push("/dashboard");
      return;
    }
  }, [data, router]);

  useEffect(() => {
    setInterval(() => {
      setNow(Date.now());
    }, 1000);
  }, []);

  useEffect(() => {
    if (token && permafrost && router && notifications) {
      permafrost.auth
        .token({ token })
        .then((result) => {
          browserStorage()?.set("auth", result);
          router.replace("/dashboard");
        })
        .catch((result) => {
          notifications.fromError(result);
          router.replace("/auth");
        });
    }
  }, [token, permafrost, router, notifications]);

  const sendVerificationEmail = () => {
    setLoading(true);
    permafrost.users
      .requestEmailVerification()
      .then((response) => {
        setCanResendAt(Date.now() + 30 * 1000);
        notifications.create({
          type: "success",
          text: "Verification email sent",
        });
      })
      .catch((error) => {
        notifications.fromError(error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="flex-grow flex flex-col gap-8">
        <h2 className="font-bold text-2xl">Verify Email</h2>
        <p>
          Your email has not yet been verified. Please verify your email before
          logging into your account. Once you have verified your email, reload
          this page and you will be redirected to the dashboard.
        </p>
        <p>
          If you have not received an e-mail with a verification link, please
          check your spam folder. If you still have not received an e-mail, you
          can request a new verification e-mail by clicking the button below.
        </p>
      </div>
      <div className="flex flex-row gap-2 w-full">
        <Button
          onClick={() => {
            const notif = notifications.create({
              type: "info",
              text: "Logging out...",
            });

            permafrost.users.sessions
              .delete(permafrost.auth.session!.id)
              .catch((e) => {
                notifications.create({
                  type: "error",
                  text: "Session could not be deleted when signing out. It will need to be removed manually by another session.",
                });
                notif.remove();
              })
              .then(() => {
                browserStorage()?.clear();
                browserStorage(true)?.clear();
                permafrost.auth.logout();

                notif.setType("success");
                notif.setText("Logged out!");

                router.push("/auth");
              });
          }}
          shape="square"
          color="secondary"
        >
          <OutlinedIcon icon="arrow_back" />
        </Button>
        <Button
          className="flex-grow"
          onClick={sendVerificationEmail}
          disabled={
            (canResendAt !== undefined && canResendAt >= now) || loading
          }
        >
          {loading ? (
            <Loader color="#185ebe" />
          ) : canResendAt !== undefined && canResendAt >= now ? (
            <TimeAgo
              live
              formatter={(value, unit, suffix, now, next) => {
                return `${value} ${unit}${value !== 1 ? "s" : ""}`;
              }}
              date={new Date(canResendAt)}
            />
          ) : (
            "Resend"
          )}
        </Button>
      </div>
    </>
  );
}

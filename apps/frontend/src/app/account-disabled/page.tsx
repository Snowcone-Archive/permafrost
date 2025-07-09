"use client";

import Button from "@/components/inputs/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { browserStorage } from "@/utils/storage";
import { useRouter } from "next/navigation";

import "./module.css";
import PermafrostRedIcon from "@/components/icons/PermafrostRed.svg";

export default function AccountDisabledPage() {
  const notifications = useNotifications();
  const permafrost = usePermafrost();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center flex-col h-[100vh] gap-8 p-6 overflow-y-auto account-disabled-container">
      <div className="font-bold text-3xl flex flex-row items-center gap-4">
        <PermafrostRedIcon
          className="w-16 h-16 border-t-[1px] border-t-[#FFF4] rounded-xl border-b-[1px] border-b-[#0004]"
          style={{
            boxShadow: "0px 5px 50px 05px rgba(0, 0, 0, 0.25)",
          }}
        />
        Permafrost
      </div>

      <main
        className="flex flex-col gap-3 lg:text-center lg:p-8 p-6 bg-[#3D0D0D] text-[#fffc] border-t-[1px] border-t-[#fff2] rounded-xl border-b-[1px] border-b-[#0004]"
        style={{
          boxShadow: "0px 5px 50px 0px rgba(0, 0, 0, 0.25)",
        }}
      >
        <h1 className="text-white lg:text-2xl text-xl font-bold">
          Your account has been disabled
        </h1>
        <p className="max-w-xl">
          An administrator has disabled your account. Any active applications
          you own had their tokens reset to prevent abuse.
        </p>
        <p className="max-w-xl">
          If you want a copy of your account data or believe this is a mistake,
          please contact an administrator via e-mail at{" "}
          <a
            className="text-[#ff4f4f] hover:underline"
            href="mailto:support@snowflake.blue"
          >
            support@snowflake.blue
          </a>{" "}
          or on Discord.
        </p>
        <p className="max-w-xl">
          More info has been sent to your inbox recipients, such as e-mail and
          Discord DMs.
        </p>
      </main>

      <Button
        className="mt-2"
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
        color="danger"
      >
        Log Out
      </Button>
    </div>
  );
}

"use client";

import { OutlinedIcon } from "@/components/OutlinedIcon";
import ApplicationIcon from "@/components/icons/ApplicationIcon";
import Button from "@/components/inputs/Button";
import DatapointArea from "@/components/DatapointArea";
import Input from "@/components/inputs/Input";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";

const allowedTypes = ["image/png", "image/apng", "image/gif", "image/jpeg"];

export default function ApplicationProfile() {
  const { id } = useParams<{ id: string }>();
  const permafrost = usePermafrost();
  const notifications = useNotifications();

  const [updating, setUpdating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(id),
    {
      onError(err, key, config) {
        notifications.fromError(err);
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(error);
        console.log("Will retry");
      },
    }
  );

  useEffect(() => {
    setName(data?.name || "");
  }, [data]);

  const [name, setName] = useState(data?.name || "");
  const [cacheBuster, setCacheBuster] = useState("");

  const refreshIcon = () => {
    setCacheBuster(new Date().getTime().toString());
  };

  const deleteImage = () => {
    permafrost.applications.icon.delete(id).then(() => {
      notifications.create({
        type: "success",
        text: "Image deleted successfully.",
      });
      refreshIcon();
    });
  };

  const pushUpdates = () => {
    setUpdating(true);

    permafrost.applications
      .update(id, {
        name,
      })
      .then((app) => {
        if (!app) return;
        notifications.create({
          type: "success",
          text: "Application updated successfully.",
        });
        setUpdating(false);
        mutate(app, {
          revalidate: false,
        });
      })
      .catch((e) => {
        notifications.fromError(e);
      });
  };

  return isLoading ? (
    <Loader center />
  ) : (
    <main className="flex flex-col gap-4">
      <DatapointArea
        icon={<OutlinedIcon icon="image" className="text-xl" />}
        title="Icon"
      >
        <main className="flex flex-row gap-4 mt-1 items-center">
          <div>
            <div className="w-24 h-24">
              <ApplicationIcon
                id={data?.id}
                size="2xl"
                cacheBuster={cacheBuster}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold leading-7">{data?.name}</h1>
            <div className="flex flex-row gap-2">
              <Button
                shape="slim"
                color="danger"
                variant="flat"
                onClick={() => {
                  deleteImage();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </main>
      </DatapointArea>
      <DatapointArea
        icon={<OutlinedIcon icon="feed" className="text-xl" />}
        title="Name"
      >
        <Input
          className="mt-1"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </DatapointArea>
      <div className="sm:grid sm:grid-cols-3 flex flex-col gap-2">
        <DatapointArea
          icon={<OutlinedIcon icon="language" className="text-xl" />}
          title="Website"
        >
          {data?.homepageURL || "None"}
        </DatapointArea>
        <DatapointArea
          icon={<OutlinedIcon icon="local_library" className="text-xl" />}
          title="Terms of Service"
        >
          {data?.termsOfServiceURL || "None"}
        </DatapointArea>
        <DatapointArea
          icon={<OutlinedIcon icon="shield_person" className="text-xl" />}
          title="Privacy Policy"
        >
          {data?.privacyPolicyURL || "None"}
        </DatapointArea>
      </div>
      <div className="w-full flex justify-end gap-3 ">
        <Button
          shape="slim"
          color="success"
          variant="flat"
          disabled={updating || !name || name == data?.name}
          onClick={pushUpdates}
        >
          Save
        </Button>
      </div>
    </main>
  );
}

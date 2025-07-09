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
    setWebsite(data?.homepageURL || "");
    setTos(data?.termsOfServiceURL || "");
    setPrivacyPolicy(data?.privacyPolicyURL || "");
  }, [data]);

  const [name, setName] = useState(data?.name || "");
  const [website, setWebsite] = useState(data?.homepageURL || "");
  const [tos, setTos] = useState(data?.termsOfServiceURL || "");
  const [privacyPolicy, setPrivacyPolicy] = useState(
    data?.privacyPolicyURL || ""
  );

  const fileAreaRef = useRef<HTMLInputElement>(null);
  const [cacheBuster, setCacheBuster] = useState("");
  const [dragAndDropEntered, setDragAndDropEntered] = useState(false);

  const refreshIcon = () => {
    setCacheBuster(new Date().getTime().toString());
  };

  const verifyFile = (files: FileList) => {
    if (files.length > 1) {
      notifications.create({
        type: "info",
        text: "You may only upload one file.",
      });
      return;
    }

    if (!allowedTypes.includes(files[0].type)) {
      notifications.create({
        type: "info",
        text: "You may only upload PNG, APNG, GIF, or JPG files.",
      });
      return;
    }

    permafrost.applications.icon.update(id, { file: files[0] }).then(() => {
      notifications.create({
        type: "success",
        text: "Image uploaded successfully.",
      });
      refreshIcon();
    });
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
        homepageURL: website,
        termsOfServiceURL: tos,
        privacyPolicyURL: privacyPolicy,
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
      <DatapointArea icon={<OutlinedIcon icon="feed" />} title="Name">
        <Input
          className="mt-1"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </DatapointArea>
      <DatapointArea icon={<OutlinedIcon icon="image" />} title="Icon">
        <main
          className="flex flex-col sm:flex-row gap-4 mt-1 items-center"
          onDropCapture={(e) => {
            e.preventDefault();
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            verifyFile(e.dataTransfer.files);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragAndDropEntered(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragAndDropEntered(false);
          }}
        >
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
            <div>
              Upload a PNG, JPG, APNG or GIF file, up to 10MB and with an ideal
              resolution of 512x512 px. You can also drag and drop an image
              here.
            </div>
            <div>
              <input
                type="file"
                className="hidden"
                ref={fileAreaRef}
                onInput={(e) => {
                  verifyFile((e.target as any).files!);
                }}
              />
              <div className="flex flex-row gap-2">
                <Button
                  shape="slim"
                  color="secondary"
                  variant="flat"
                  onClick={() => {
                    fileAreaRef.current?.click();
                  }}
                >
                  Select
                </Button>

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
          </div>
        </main>
      </DatapointArea>
      <DatapointArea icon={<OutlinedIcon icon="language" />} title="Website">
        <Input
          className="mt-1"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
          }}
        />
      </DatapointArea>
      <DatapointArea
        icon={<OutlinedIcon icon="local_library" />}
        title="Terms of Service"
      >
        <Input
          className="mt-1"
          value={tos}
          onChange={(e) => {
            setTos(e.target.value);
          }}
        />
      </DatapointArea>
      <DatapointArea
        icon={<OutlinedIcon icon="shield_person" />}
        title="Privacy Policy"
      >
        <Input
          className="mt-1"
          value={privacyPolicy}
          onChange={(e) => {
            setPrivacyPolicy(e.target.value);
          }}
        />
      </DatapointArea>
      <div className="w-full flex justify-end gap-3 ">
        <Link href="/dashboard/applications">
          <Button shape="slim" color="secondary" variant="flat">
            Cancel
          </Button>
        </Link>
        <Button
          shape="slim"
          color="success"
          variant="flat"
          disabled={
            updating ||
            !name ||
            (name == data?.name &&
              website == data?.homepageURL &&
              tos == data?.termsOfServiceURL &&
              privacyPolicy == data?.privacyPolicyURL)
          }
          onClick={pushUpdates}
        >
          Save
        </Button>
      </div>
    </main>
  );
}

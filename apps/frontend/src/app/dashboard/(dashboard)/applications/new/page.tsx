"use client";

import Collaborators from "@/components/Collaborators";
import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";
import { browserStorage } from "@/utils/storage";
import type { UserPrimitive } from "@snowflake-software/permafrost-js";
import { useWindowSize } from "@uidotdev/usehooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const allowedTypes = ["image/png", "image/apng", "image/gif", "image/jpeg"];

export default function NewApplication() {
  const router = useRouter();
  const permafrost = usePermafrost();
  const notifications = useNotifications();
  const { width } = useWindowSize();

  const [name, setName] = useState("");
  const [image, setImage] = useState<File>();

  const [creating, setCreating] = useState(false);
  const [canCreate, setCanCreate] = useState(false);

  const [collaborators, setCollaborators] = useState<UserPrimitive[]>([]);

  const [dragAndDropEntered, setDragAndDropEntered] = useState(false);
  const fileAreaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCanCreate(name.length > 0);
  }, [name]);

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

    setImage(files[0]);
  };

  const create = () => {
    if (creating) return;

    setCreating(true);

    notifications.create({
      type: "info",
      text: "Creating application...",
    });

    permafrost.applications
      .create({
        name,
        collaborators: collaborators.map((collaborator) => collaborator.id),
      })
      .then((result) => {
        new Promise<void>((res) => {
          if (image) {
            permafrost.applications.icon
              .update(result.id, { file: image })
              .then(() => {
                res();
              });
          } else {
            res();
          }
        }).then(() => {
          browserStorage(true)?.set(
            `app-${result.id}-client-secret`,
            result.clientSecret
          );
          router.push(`/dashboard/applications/${result.id}/profile`);
        });
      });
  };

  return permafrost.auth.user?.permissions.includes("CreateApplication") ? (
    <main className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Create new app</h1>
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
          className="flex sm:flex-row flex-col gap-4 mt-1 items-center"
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
            <div
              className="w-24 h-24 rounded-full"
              style={{
                background: `url("${
                  image ? URL.createObjectURL(image) : "/appIcon.png"
                }") 0% 0% / contain rgba(255, 255, 255, 0.2)`,
              }}
            ></div>
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
                {image && (
                  <Button
                    shape="slim"
                    color="danger"
                    variant="flat"
                    onClick={() => {
                      setImage(undefined);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </DatapointArea>
      <DatapointArea icon={<OutlinedIcon icon="group" />} title="Collaborators">
        <div>
          Collaborators are people you trust who can change application
          metadata, such as display name, icon, and links. They can also reset
          the application secret, but they cannot delete the app or add other
          collaborators.
        </div>
        <div className="h-2"></div>
        <Collaborators updateCollaborators={setCollaborators} />
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
          disabled={!canCreate || creating}
          onClick={create}
        >
          {(width || 0) < 400 ? "Create" : "Create application"}
        </Button>
      </div>
    </main>
  ) : (
    <main className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Create new app</h1>
      <p>
        You don&apos;t have permission to create applications. Please contact an
        administrator.
      </p>
      <div className="w-full flex justify-end gap-3 ">
        <Link href="/dashboard/applications">
          <Button shape="slim" color="secondary" variant="flat">
            Back
          </Button>
        </Link>
      </div>
    </main>
  );
}

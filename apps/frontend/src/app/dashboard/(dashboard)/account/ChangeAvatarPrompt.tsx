/* eslint-disable @next/next/no-img-element */
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Button from "@/components/inputs/Button";
import Prompt from "@/components/Prompt";
import { useRef, useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermafrost } from "@/contexts/PermafrostContext";

const allowedTypes = ["image/png", "image/apng", "image/gif", "image/jpeg"];

export default function ChangeAvatarPrompt({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
}) {
  const notifications = useNotifications();
  const permafrost = usePermafrost();

  const [image, setImage] = useState<File>();
  const [dragAndDropEntered, setDragAndDropEntered] = useState(false);
  const fileAreaRef = useRef<HTMLInputElement>(null);

  const updateProfilePicture = () => {
    notifications.create({
      type: "info",
      text: "Uploading image...",
    });

    permafrost.users.avatar
      .update({ file: image! })
      .then((data) => {
        if (!data) return;
        notifications.create({
          type: "success",
          text: "Profile picture updated.",
        });
        setVisible(false);
        resetState();
      })
      .catch((err) => {
        notifications.fromError(err);
      });
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

    setImage(files[0]);
  };

  const resetState = () => {
    setTimeout(() => {
      setImage(undefined);
    }, 250);
  };

  return (
    <Prompt
      visible={visible}
      buttons={
        image === undefined ? (
          <Button
            shape="slim"
            color="secondary"
            variant="flat"
            onClick={() => {
              resetState();
              setVisible(false);
            }}
          >
            Cancel
          </Button>
        ) : (
          [
            <Button
              shape="slim"
              color="danger"
              variant="flat"
              key="undo"
              disabled={image === undefined}
              onClick={() => {
                setImage(undefined);
              }}
            >
              Undo
            </Button>,
            <Button
              shape="slim"
              color="primary"
              variant="flat"
              key="upload"
              disabled={image === undefined}
              onClick={updateProfilePicture}
            >
              Upload
            </Button>,
          ]
        )
      }
    >
      {image === undefined ? (
        <div>
          <h2 className="text-2xl font-bold">Change profile picture</h2>
          <p className="text-snowflake-gray-1">
            Upload a PNG, JPG, APNG or GIF file, up to 5MB and at least 128x128.
          </p>
          <div
            className={`border-4 border-dashed cursor-pointer ${
              !dragAndDropEntered ? "border-[#ffffff22]" : "border-[#207efeff]"
            } flex flex-col items-center py-6 px-8 transition-colors rounded-3xl mt-2`}
            onClick={() => {
              fileAreaRef.current?.click();
            }}
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
            <div className="pointer-events-none">
              <OutlinedIcon
                icon="photo_camera"
                className="text-3xl pointer-events-none"
              />
            </div>
            <div className="text-lg pointer-events-none font-bold">
              Drag profile photo here
            </div>
            <div className="text-[#ffffff66] leading-3 pointer-events-none">
              or click to choose a file
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold">Change profile picture</h2>
            <p className="text-snowflake-gray-1">
              This is how you will appear on Permafrost.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={URL.createObjectURL(image)}
              className="w-[128px] h-[128px] rounded-full"
              alt="Photo"
            />
          </div>
        </div>
      )}
      <input
        type="file"
        className="hidden"
        ref={fileAreaRef}
        onInput={(e) => {
          verifyFile((e.target as any).files!);
        }}
      />
    </Prompt>
  );
}

import DiscordIcon from "@/components/icons/Discord.svg";
import GithubIcon from "@/components/icons/Github.svg";
import Button from "@/components/inputs/Button";
import Loader from "@/components/Loader";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import { useEffect, useState } from "react";

const icons = {
  discord: () => <DiscordIcon />,
  github: () => <GithubIcon />,
  passkey: () => <OutlinedIcon icon="key" />,
};

const names = {
  discord: "Discord",
  github: "GitHub",
  passkey: "Passkey",
};

export default function LoginOption(props: {
  locked: boolean;
  backgroundColor: string;
  icon: "discord" | "github" | "passkey";
  totalLoginOptions: number;

  setLocked: (locked: boolean) => void;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [lockThis, setLockThis] = useState(false);

  useEffect(() => {
    if (loading) {
      props.setLocked(true);
    }
  }, [loading, props]);

  useEffect(() => {
    setLockThis(props.locked);
  }, [props.locked]);

  return (
    <Button
      disabled={lockThis || loading}
      shape="slim"
      className="flex-grow flex"
      style={{ backgroundColor: props.backgroundColor }}
      onClick={() => {
        setLoading(true);
        props.onClick();
      }}
    >
      <div
        className="relative flex text-white items-center justify-center gap-2"
        style={{
          transform: "translate(1%, 0)",
        }}
      >
        {icons[props.icon]()}
        {props.totalLoginOptions <= 2 && <span>{names[props.icon]}</span>}
        {loading && (
          <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <Loader color="#207efe" />
          </span>
        )}
      </div>
    </Button>
  );
}

import { createContext } from "react";

type PasskeyContext = {
  mutate: () => void;
  setRenamingID?: (id: string | undefined) => void;
  renamingID?: string | undefined;
  renamingCurrentName?: string;
  setRenamingCurrentName?: (name: string) => void;
};

export const PasskeyContext = createContext<PasskeyContext>({
  mutate: () => {},
  setRenamingID: undefined,
  renamingID: undefined,
  renamingCurrentName: undefined,
  setRenamingCurrentName: undefined,
});

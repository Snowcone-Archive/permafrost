import { OutlinedIcon } from "@/components/OutlinedIcon";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Input from "@/components/inputs/Input";
import { usePermafrost } from "@/contexts/PermafrostContext";
import type { UserPrimitive } from "@snowflake-software/permafrost-js";
import { useEffect, useState } from "react";

export default function UserSearch({
  onUserSelect,
  select,
  clearOnSelect = false,
  inputClassName,
}: {
  onUserSelect?: (user: UserPrimitive | undefined) => void;
  select?: UserPrimitive;
  clearOnSelect?: boolean;
  inputClassName?: string;
}) {
  const permafrost = usePermafrost();

  const [selected, setSelected] = useState<UserPrimitive | undefined>(select);

  const [searchSelected, setSearchSelected] = useState<boolean>(false);
  const [buttonFocused, setButtonFocused] = useState<boolean>(false);

  const [usernameSearch, setUsernameSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserPrimitive[]>([]);

  const [keyboardSelectedIndex, setKeyboardSelectedIndex] =
    useState<number>(-1);

  useEffect(() => {
    if (usernameSearch.length < 3) {
      setSearchResults([]);
      return;
    }

    permafrost.users.search(usernameSearch).then((data) => {
      setSearchResults(data);
    });
  }, [usernameSearch, permafrost.users]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {selected == null ? (
          <Input
            value={usernameSearch}
            placeholder="Search by username..."
            className={`w-full ${
              searchSelected || buttonFocused ? "!rounded-b-none" : ""
            } ${inputClassName}`}
            blurOnEnter
            onFocus={() => {
              setSearchSelected(true);
            }}
            onBlur={() => {
              setSearchSelected(false);
            }}
            onChange={(e) => {
              setUsernameSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setKeyboardSelectedIndex(
                  Math.min(keyboardSelectedIndex + 1, searchResults.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setKeyboardSelectedIndex(
                  Math.max(keyboardSelectedIndex - 1, -1)
                );
              } else if (e.key === "Enter") {
                if (keyboardSelectedIndex !== -1) {
                  !clearOnSelect &&
                    setSelected(searchResults[keyboardSelectedIndex]);
                  onUserSelect &&
                    onUserSelect(searchResults[keyboardSelectedIndex]);
                  setKeyboardSelectedIndex(-1);
                  setUsernameSearch("");
                }
              }
            }}
          />
        ) : (
          <button
            className={`${inputClassName} w-full outline-none transition-all duration-300 ease-out bg-snowflake-gray-3 px-2 py-2 text-white border-solid border-[2px] border-[#232538] rounded-lg text-md text-left flex flex-row gap-2 justify-between`}
            onClick={() => {
              setSelected(undefined);
              onUserSelect && onUserSelect(undefined);
            }}
          >
            <span className="flex flex-row gap-1">
              <ProfilePicture id={selected.id} size="xs" className="mr-1" />
              {selected.displayName ? selected.displayName : selected.username}
              <span className="text-snowflake-gray-1">
                {selected.displayName ? `(@${selected.username})` : ""}
              </span>
            </span>
            <OutlinedIcon icon="delete" />
          </button>
        )}
        {(searchSelected || buttonFocused) && (
          <div className="absolute w-full bg-snowflake-bg-dim shadow-lg rounded-b-lg z-10 p-2">
            {usernameSearch.length < 3 && (
              <div className="opacity-50">Type at least 3 characters.</div>
            )}
            {searchResults.length === 0 && usernameSearch.length >= 3 && (
              <div className="opacity-50">No results found.</div>
            )}
            {searchResults.map((user) => (
              <button
                key={user.id}
                className={`p-2 hover:bg-[#fff1] rounded-lg cursor-pointer w-full flex justify-between items-center ${
                  keyboardSelectedIndex === searchResults.indexOf(user)
                    ? "bg-[#fff1]"
                    : ""
                }`}
                onMouseDown={() => {
                  setButtonFocused(true);
                }}
                onClick={() => {
                  !clearOnSelect && setSelected(user);
                  onUserSelect && onUserSelect(user);
                  setButtonFocused(false);
                  setUsernameSearch("");
                }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <ProfilePicture id={user.id} size="sm" />
                  {user.displayName && (
                    <div className="leading-3">
                      {user.displayName || user.username}
                    </div>
                  )}
                  <div
                    className={`${
                      user.displayName ? "opacity-50" : ""
                    } leading-3`}
                  >
                    @{user.username}
                  </div>
                </div>
                <OutlinedIcon icon="add" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

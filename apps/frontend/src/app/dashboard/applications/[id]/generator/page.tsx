"use client";

import DatapointArea from "@/components/DatapointArea";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import Checkbox from "@/components/inputs/Checkbox";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import { usePermafrost } from "@/contexts/PermafrostContext";
import Link from "next/link";
import { useParams } from "next/navigation";
import { escape } from "querystring";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Generator() {
  const { id } = useParams<{ id: string }>();
  const permafrost = usePermafrost();

  const { data, error, isLoading, mutate } = useSWR(
    "application-" + id,
    async () => permafrost.applications.get(id)
  );

  const [readEmail, setReadEmail] = useState(false);
  const [redirectURI, setRedirectURI] = useState("");

  const [oauthLink, setOauthLink] = useState("");

  useEffect(() => {
    const scope = [];
    if (readEmail) scope.push("email");
    scope.push("profile");

    setOauthLink(
      `${window.location.protocol}//${
        window.location.host
      }/authorize?client_id=${id}&scope=${scope.join(
        ","
      )}&redirect_uri=${escape(redirectURI)}`
    );
  }, [readEmail, redirectURI, id]);
  return (
    <section className="flex flex-col gap-2">
      <DatapointArea
        title="Scopes"
        icon={<OutlinedIcon icon="beenhere" />}
        className="mb-2"
      >
        <section className="flex flex-col gap-3">
          <Checkbox checked disabled>
            <div className="ml-1">
              <header className="leading-5 font-medium">
                Read public data
              </header>
              <div className="opacity-50 leading-5">
                Allows read access to the user ID, username, display name and
                avatar.
              </div>
            </div>
          </Checkbox>
          <Checkbox
            onChange={(e) => {
              setReadEmail(e.currentTarget.ariaChecked as any as boolean);
            }}
          >
            <div className="ml-1">
              <header className="leading-5 font-medium">
                Read private data
              </header>
              <div className="opacity-50 leading-5">
                Allows read access to the e-mail address and session devices.
              </div>
            </div>
          </Checkbox>
        </section>
      </DatapointArea>

      <DatapointArea
        title="Redirect URI"
        icon={<OutlinedIcon icon="captive_portal" />}
        className="mb-1"
      >
        {data?.redirectURIs.length === 0 ? (
          <p className="italic">
            No redirect URIs are available. Please add one in the{" "}
            <Link
              href="integration"
              className="text-snowflake-fg-info hover:underline"
            >
              Integration tab
            </Link>
            .
          </p>
        ) : (
          <Select
            onChange={(value) => {
              if (!value) return;
              setRedirectURI(value);
            }}
          >
            {
              data?.redirectURIs.map((uri) => {
                return (
                  <option key={uri} value={uri}>
                    {uri}
                  </option>
                );
              }) as React.ReactElement<HTMLOptionElement>[]
            }
          </Select>
        )}
      </DatapointArea>

      <DatapointArea
        title="Result"
        icon={<OutlinedIcon icon="link" />}
        className="mb-1 mt-6"
      >
        <Input value={oauthLink} readOnly copyable className="bg-[#383b55]" />
      </DatapointArea>
    </section>
  );
}

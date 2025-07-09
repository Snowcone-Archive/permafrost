"use client";

import ApplicationIcon from "@/components/icons/ApplicationIcon";
import PermafrostIcon from "@/components/icons/Permafrost.svg";
import ProfilePicture from "@/components/icons/ProfilePicture";
import Button from "@/components/inputs/Button";
import { OutlinedIcon } from "@/components/OutlinedIcon";
import StatusIndicator from "@/components/StatusIndicator";
import VERSION from "@/consts";
import { useMetadata } from "@/contexts/MetadataContext";
import { useWindowSize } from "@uidotdev/usehooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthRedirect from "./(dashboard)/AuthRedirect";
import NavButton from "./NavigationButton";

type NavbarItem = {
  title: string;
  icon: string;
  href: string | undefined;
  displayCondition?: boolean;
  dangerous?: boolean;
};

type Props = {
  navigationSections: {
    title: string;
    items: NavbarItem[];
  }[];
  back?: string;
  footerItems?: (NavbarItem & {
    href: string | undefined;
    onClick?: () => void;
  })[];
  dropdown?: {
    type: "user" | "application";
    loading: boolean;
    selected: {
      name: string;
      id: string;
    };
    selections: {
      name: string;
      link: string;
      href?: string;
      id: string;
    }[];
  };
  children: React.ReactNode;
};

export default function SidebarLayout({
  navigationSections,
  back,
  footerItems,
  dropdown,
  children,
}: Props) {
  const metadata = useMetadata();
  const pathname = usePathname();
  const { width } = useWindowSize();

  const [wideContent, setWideContent] = useState<boolean>(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    setWideContent(pathname.includes("audit-log") === true);
  }, [pathname]);

  return (
    <main className="flex flex-col lg:flex-row gap-4 justify-center p-6 lg:p-12 items-center md:items-start">
      <AuthRedirect />
      <header className="flex lg:hidden justify-between items-center w-full">
        <Button
          variant="shaded"
          shape="squareMedium"
          color="secondary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <OutlinedIcon icon="menu" />
        </Button>
        <div className="text-2xl font-bold">Permafrost</div>
        {(width || 0) < 1024 && (
          <PermafrostIcon className="w-10 h-10 border-t-[1px] border-t-[#FFF4] rounded-xl border-b-[1px] border-b-[#0004]" />
        )}
      </header>
      <nav
        className={`${!menuOpen ? "hidden" : "flex"} ${
          wideContent ? "basis-96 flex-grow" : ""
        } flex-col gap-4 w-72 lg:w-80 flex-shrink lg:flex fixed lg:static left-0 top-0 p-6 bg-[#17192c] z-40 h-[calc(100dvh)] justify-between lg:bg-transparent lg:h-auto overflow-visible`}
      >
        <div className="font-bold text-3xl flex-row items-center gap-4 lg:flex hidden">
          {(width || 0) >= 1024 && (
            <PermafrostIcon
              className="w-16 h-16 border-t-[1px] border-t-[#FFF4] rounded-xl border-b-[1px] border-b-[#0004]"
              style={{
                boxShadow: "0px 5px 50px 05px rgba(0, 0, 0, 0.25)",
              }}
            />
          )}
          Permafrost
        </div>
        <Button
          variant="shaded"
          shape="squareMedium"
          color="secondary"
          className="lg:hidden flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <OutlinedIcon icon="close" />
        </Button>
        <section className="flex flex-col gap-4">
          {dropdown && (
            <div
              className={`p-2 bg-snowflake-gray-3 h-10 relative ${
                dropdown.selections.length > 1 ? "cursor-pointer" : ""
              } ${
                dropdownVisible ? "drop-shadow-[0_0_1px_#191a2d] z-20" : ""
              } ${dropdownVisible ? "rounded-t-lg" : "rounded-lg"}`}
              onClick={() => {
                setDropdownVisible(
                  !dropdownVisible && dropdown.selections.length > 1
                );
              }}
            >
              <span className="flex justify-between w-full">
                <span
                  className={`${
                    dropdown.selections.length > 1 ? "w-[90%]" : "w-full"
                  } flex flex-row gap-2`}
                >
                  {dropdown.type === "application" ? (
                    <ApplicationIcon id={dropdown.selected.id} size="xs" />
                  ) : (
                    <ProfilePicture id={dropdown.selected.id} size="xs" />
                  )}
                  <span
                    className="text-ellipsis truncate"
                    title={dropdown.selected.name}
                  >
                    {dropdown.loading
                      ? "Loading..."
                      : dropdown.selected.name || "Unknown"}
                  </span>
                </span>
                {dropdown.selections.length > 1 && (
                  <OutlinedIcon
                    icon={dropdownVisible ? "expand_less" : "expand_more"}
                  />
                )}
              </span>
              {dropdownVisible && (
                <div
                  className={`absolute top-10 left-0 w-full bg-[#191c33] rounded-b-lg flex flex-col gap-1 drop-shadow-[0_0_1px_#191a2d] z-10`}
                >
                  {dropdown.selections
                    .filter((item) => !pathname.startsWith(item.link))
                    .map((selection, index) => (
                      <Link
                        onClick={() => setMenuOpen(false)}
                        href={selection.href || selection.link}
                        key={selection.id}
                      >
                        <div
                          className={`flex flex-row gap-2 p-1 cursor-pointer h-10 items-center px-2 hover:bg-[#232642] ${
                            index === dropdown.selections.length - 2
                              ? "rounded-b-lg"
                              : ""
                          }`}
                        >
                          {dropdown.type === "application" ? (
                            <ApplicationIcon id={selection.id} size="xs" />
                          ) : (
                            <ProfilePicture id={selection.id} size="xs" />
                          )}
                          <span
                            className="w-full truncate text-ellipsis"
                            title={selection.name}
                          >
                            {selection.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          )}

          <section className="flex flex-col gap-4">
            {navigationSections.map((section) => (
              <section key={section.title} className="flex flex-col gap-1">
                <header className="text-snowflake-gray-1 font-bold text-l">
                  {section.title}
                </header>
                {section.items
                  .filter(
                    (i) =>
                      i.displayCondition === undefined ||
                      i.displayCondition === true
                  )
                  .map((item) => (
                    <NavButton
                      key={item.title}
                      symbol={item.icon}
                      path={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={
                        item.dangerous
                          ? " hover:bg-[#ff4f4f08] text-snowflake-fg-danger bg-opacity-95"
                          : ""
                      }
                    >
                      {item.title}
                    </NavButton>
                  ))}
              </section>
            ))}
          </section>
        </section>
        <section className="flex flex-col gap-4">
          <section className="flex flex-col gap-1">
            {back ? (
              <NavButton symbol="arrow_back" path={back}>
                Back
              </NavButton>
            ) : null}
            {footerItems
              ?.filter(
                (i) =>
                  i.displayCondition === undefined ||
                  i.displayCondition === true
              )
              .map((item) => (
                <NavButton
                  key={item.title}
                  symbol={item.icon}
                  path={item.href}
                  onClick={() => {
                    item.onClick && item.onClick();
                    setMenuOpen(false);
                  }}
                  hoverColorOverride={item.dangerous}
                  className={
                    item.dangerous
                      ? " hover:bg-[#ff4f4f16] text-snowflake-fg-danger bg-opacity-95"
                      : ""
                  }
                >
                  {item.title}
                </NavButton>
              ))}
          </section>
          <section>
            <StatusIndicator />
            {metadata.metadata?.version === VERSION ? (
              <p className="text-snowflake-gray-1 text-xs">
                Version {metadata.metadata?.version} ({process.env.NODE_ENV})
              </p>
            ) : (
              <>
                <p className="text-snowflake-gray-1 text-xs">
                  Backend Version {metadata.metadata?.version} (
                  {process.env.NODE_ENV})
                </p>
                <p className="text-snowflake-gray-1 text-xs flex place-items-center gap-1">
                  Frontend Version {VERSION} ({process.env.NODE_ENV})
                  <OutlinedIcon
                    className="text-base text-snowflake-fg-warning"
                    icon="warning"
                  />
                </p>
              </>
            )}

            <div className="text-snowflake-gray-1 text-xs">
              Snowflake-Software © 2023-2025
            </div>
          </section>
        </section>
      </nav>
      {menuOpen && (
        <div className="z-30 fixed top-0 left-0 bg-[#0009] w-full h-screen backdrop-blur-sm lg:hidden"></div>
      )}
      <article
        className={`p-4 ${
          wideContent ? "flex-shrink" : "max-w-[48rem] flex-grow"
        } w-full `}
      >
        {children}
      </article>
    </main>
  );
}

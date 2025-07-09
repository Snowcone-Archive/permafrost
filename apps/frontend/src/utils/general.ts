import { escape } from "querystring";

export const censorEmailAddress = (email: string) => {
  const atIndex = email.indexOf("@");
  return atIndex <= 4
    ? "*".repeat(email.slice(0, atIndex).length) + email.slice(atIndex)
    : email.slice(0, 2) +
        "*".repeat(Math.max(0, atIndex - 2)) +
        email.slice(atIndex);
};

export const createContinueUrl = (continueUrl?: string) => {
  if (continueUrl === undefined)
    continueUrl = window.location.pathname + window.location.search;

  return trimSlashes(continueUrl).length === 0
    ? ""
    : `?continue=${escape(continueUrl)}`;
};

export const trimSlashes = (str: string): string => {
  return str.replace(/^\/+|\/+$/g, "");
};

export const pageRequiresAuthentication = (page: string) => {
  return (
    !(
      trimSlashes(page).startsWith("auth") &&
      !trimSlashes(page).startsWith("authorize")
    ) || trimSlashes(page) === ""
  );
};

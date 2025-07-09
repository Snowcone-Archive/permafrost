export const SupportedScopes = ["profile", "email"];

type Error = {
  code: string;
  message: string;
};

export const NOT_FOUND: Error = {
  code: "NotFound",
  message: "The requested resource was not found.",
};

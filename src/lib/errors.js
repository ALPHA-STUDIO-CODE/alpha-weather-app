const MESSAGES = {
  not_found: "City not found. Try another search.",
  generic: "Something went wrong. Please try again.",
};

export function getErrorMessage(errorType) {
  return MESSAGES[errorType] ?? MESSAGES.generic;
}

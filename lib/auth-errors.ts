type ClerkError = {
  code?: string;
  message?: string;
  longMessage?: string;
};

export function getAuthError(
  error: ClerkError | null | undefined
) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "form_identifier_not_found":
      return "We couldn't find an account with that email.";

    case "form_password_incorrect":
      return "The password you entered is incorrect.";

    case "form_identifier_exists":
      return "An account with this email already exists.";

    case "form_password_pwned":
      return "Please choose a different password.";

    case "form_password_length":
      return "Your password does not meet the required length.";

    case "verification_failed":
      return "That verification code is incorrect.";

    case "verification_expired":
      return "That verification code has expired.";

    default:
      return (
        error.longMessage ||
        error.message ||
        "Something went wrong. Please try again."
      );
  }
}
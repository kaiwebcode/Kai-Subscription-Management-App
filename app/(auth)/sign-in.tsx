import AuthInput from "@/components/auth/AuthInput";
import AuthShell from "@/components/auth/AuthShell";
import { getAuthError } from "@/lib/auth-errors";
import { posthog } from "@/lib/posthog";

import { useAuth, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignIn() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [isVerifyingDevice, setIsVerifyingDevice] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [serverError, setServerError] = useState("");

  const isLoading = fetchStatus === "fetching";

  // --------------------------------------------------
  // Validate email/password
  // --------------------------------------------------

  const validate = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setServerError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Please enter your email.");
      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      valid = false;
    }

    return valid;
  };

  // --------------------------------------------------
  // Sign in
  // --------------------------------------------------

  const handleSignIn = async () => {
    if (isLoading || !validate()) {
      return;
    }

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setServerError(getAuthError(error));
        return;
      }

      // ----------------------------------------------
      // Normal login completed
      // ----------------------------------------------

      if (signIn.status === "complete") {
        await signIn.finalize();

        posthog?.capture("user_signed_in", {
          authentication_method: "password",
        });

        router.replace("/(tabs)");
        return;
      }

      // ----------------------------------------------
      // User has MFA enabled
      // ----------------------------------------------

      if (signIn.status === "needs_second_factor") {
        setServerError(
          "Additional verification is required for this account."
        );
        return;
      }

      // ----------------------------------------------
      // NEW DEVICE / DEVICE TRUST
      // ----------------------------------------------

      if (signIn.status === "needs_client_trust") {
        const emailCodeFactor =
          signIn.supportedSecondFactors?.find(
            (factor) => factor.strategy === "email_code"
          );

        if (!emailCodeFactor) {
          setServerError(
            "Email verification is not available for this account. Please configure a verification method in Clerk."
          );
          return;
        }

        const { error: sendCodeError } =
          await signIn.mfa.sendEmailCode();

        if (sendCodeError) {
          setServerError(getAuthError(sendCodeError));
          return;
        }

        posthog?.capture("device_verification_started", {
          authentication_method: "password",
          verification_method: "email_code",
        });

        setCode("");
        setCodeError("");
        setServerError("");
        setIsVerifyingDevice(true);
      }
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_in",
      });

      setServerError(
        "We couldn't sign you in right now. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Verify new device
  // --------------------------------------------------

  const handleVerifyDevice = async () => {
    const trimmedCode = code.trim();

    setCodeError("");
    setServerError("");

    if (!trimmedCode) {
      setCodeError("Please enter the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setCodeError("Enter the 6-digit verification code.");
      return;
    }

    try {
      const { error } =
        await signIn.mfa.verifyEmailCode({
          code: trimmedCode,
        });

      if (error) {
        setCodeError(getAuthError(error));
        return;
      }

      // ----------------------------------------------
      // Device verification completed
      // ----------------------------------------------

      if (signIn.status === "complete") {
        await signIn.finalize();

        posthog?.capture("user_signed_in", {
          authentication_method: "password",
          verification_method: "email_code",
          device_verification: true,
        });

        router.replace("/(tabs)");
        return;
      }

      setServerError(
        "Verification was successful, but sign-in is not complete yet."
      );
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_in",
        authentication_stage: "device_verification",
      });

      setServerError(
        "We couldn't verify this device. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Resend verification code
  // --------------------------------------------------

  const resendCode = async () => {
    if (isLoading) {
      return;
    }

    setCode("");
    setCodeError("");
    setServerError("");

    try {
      const { error } =
        await signIn.mfa.sendEmailCode();

      if (error) {
        setServerError(getAuthError(error));
        return;
      }

      posthog?.capture("device_verification_code_resent", {
        verification_method: "email_code",
      });

      setServerError(
        "A new verification code has been sent."
      );
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_in",
        authentication_stage: "verification_resend",
      });

      setServerError(
        "We couldn't send a new code. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // Start over
  // --------------------------------------------------

  const startOver = () => {
    if (isLoading) {
      return;
    }

    try {
      signIn.reset();
    } catch {
      // Ignore reset errors.
    }

    setIsVerifyingDevice(false);
    setCode("");
    setCodeError("");
    setServerError("");
  };

  // --------------------------------------------------
  // Already signed in
  // --------------------------------------------------

  if (isSignedIn) {
    return null;
  }

  // --------------------------------------------------
  // DEVICE VERIFICATION SCREEN
  // --------------------------------------------------

  if (isVerifyingDevice) {
    return (
      <AuthShell
        title="Verify your device"
        subtitle={`We sent a verification code to ${email.trim()}`}
      >
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">
                Verification code
              </Text>

              <TextInput
                value={code}
                onChangeText={(value) => {
                  setCode(
                    value.replace(/\D/g, "").slice(0, 6)
                  );

                  setCodeError("");
                  setServerError("");
                }}
                className={`auth-input auth-code-input ${
                  codeError ? "auth-input-error" : ""
                }`}
                placeholder="Enter 6-digit code"
                placeholderTextColor="rgba(8, 17, 38, 0.42)"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleVerifyDevice}
              />

              {codeError ? (
                <View className="auth-error-wrap">
                  <Text className="auth-error">
                    {codeError}
                  </Text>
                </View>
              ) : null}
            </View>

            {serverError ? (
              <View className="auth-server-error">
                <Text className="auth-helper">
                  {serverError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleVerifyDevice}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Verify device"
              className={`auth-button ${
                isLoading
                  ? "auth-button-disabled"
                  : ""
              }`}
            >
              {isLoading ? (
                <View className="auth-button-loading">
                  <ActivityIndicator
                    size="small"
                    color="#081126"
                  />

                  <Text className="auth-button-text">
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text className="auth-button-text">
                  Verify device
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={resendCode}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
              className="auth-secondary-button"
            >
              <Text className="auth-secondary-button-text">
                Resend code
              </Text>
            </Pressable>

            <Pressable
              onPress={startOver}
              disabled={isLoading}
              className="auth-back"
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
            >
              <Text className="auth-helper">
                Back to sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthShell>
    );
  }

  // --------------------------------------------------
  // NORMAL SIGN IN SCREEN
  // --------------------------------------------------

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your subscriptions"
    >
      <View className="auth-card">
        <View className="auth-form">
          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError("");
              setServerError("");
            }}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            error={emailError}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError("");
              setServerError("");
            }}
            password
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            error={passwordError}
            onSubmitEditing={handleSignIn}
          />

          {serverError ? (
            <View className="auth-server-error">
              <Text className="auth-error">
                {serverError}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            className={`auth-button ${
              isLoading
                ? "auth-button-disabled"
                : ""
            }`}
          >
            {isLoading ? (
              <View className="auth-button-loading">
                <ActivityIndicator
                  size="small"
                  color="#081126"
                />

                <Text className="auth-button-text">
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text className="auth-button-text">
                Sign in
              </Text>
            )}
          </Pressable>
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">
            New to SubFlow?
          </Text>

          <Link
            href="/(auth)/sign-up"
            asChild
          >
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Create a SubFlow account"
              hitSlop={8}
            >
              <Text className="auth-link">
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
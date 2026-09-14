import AuthInput from "@/components/auth/AuthInput";
import AuthShell from "@/components/auth/AuthShell";
import { getAuthError } from "@/lib/auth-errors";
import { posthog } from "@/lib/posthog";

import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";

import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUp() {
  const router = useRouter();

  const { isSignedIn } = useAuth();
  const { signUp, fetchStatus } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [code, setCode] = useState("");

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [codeError, setCodeError] =
    useState("");
  const [serverError, setServerError] =
    useState("");

  const isLoading =
    fetchStatus === "fetching";

  const validateAccount = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setServerError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError(
        "Please enter your email."
      );
      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setEmailError(
        "Please enter a valid email address."
      );
      valid = false;
    }

    if (!password) {
      setPasswordError(
        "Please enter a password."
      );
      valid = false;
    } else if (password.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters."
      );
      valid = false;
    }

    return valid;
  };

  const handleSignUp = async () => {
    if (isLoading || !validateAccount()) {
      return;
    }

    try {
      const { error } =
        await signUp.password({
          emailAddress:
            email.trim().toLowerCase(),
          password,
        });

      if (error) {
        setServerError(
          getAuthError(error)
        );
        return;
      }

      const { error: sendError } =
        await signUp.verifications.sendEmailCode();

      if (sendError) {
        setServerError(
          getAuthError(sendError)
        );
        return;
      }

      posthog?.capture("sign_up_started", {
        authentication_method: "password",
        verification_method: "email_code",
      });
      setIsVerifying(true);
      setServerError("");
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_up",
        authentication_stage: "account_creation",
      });
      setServerError(
        "We couldn't create your account right now. Please try again."
      );
    }
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();

    setCodeError("");
    setServerError("");

    if (!trimmedCode) {
      setCodeError(
        "Please enter the verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setCodeError(
        "Enter the 6-digit verification code."
      );
      return;
    }

    try {
      const { error } =
        await signUp.verifications.verifyEmailCode(
          {
            code: trimmedCode,
          }
        );

      if (error) {
        setCodeError(
          getAuthError(error)
        );
        return;
      }

      if (signUp.status === "complete") {
        const { error: finalizeError } =
          await signUp.finalize();

        if (finalizeError) {
          setServerError(
            getAuthError(finalizeError)
          );
          return;
        }

        posthog?.capture("user_signed_up", {
          authentication_method: "password",
          verification_method: "email_code",
        });
        router.replace("/(tabs)");
      }
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_up",
        authentication_stage: "email_verification",
      });
      setServerError(
        "We couldn't verify your email. Please try again."
      );
    }
  };

  const resendCode = async () => {
    if (isLoading) {
      return;
    }

    setServerError("");
    setCodeError("");

    try {
      const { error } =
        await signUp.verifications.sendEmailCode();

      if (error) {
        setServerError(
          getAuthError(error)
        );
        return;
      }

      posthog?.capture("verification_code_resent", {
        verification_method: "email_code",
      });
      setServerError(
        "A new verification code has been sent."
      );
    } catch (error) {
      posthog?.captureException(error, {
        authentication_flow: "sign_up",
        authentication_stage: "verification_resend",
      });
      setServerError(
        "We couldn't send a new code. Please try again."
      );
    }
  };

  if (isSignedIn) {
    return null;
  }

  if (isVerifying) {
    return (
      <AuthShell
        title="Verify your email"
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
                    value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  );
                  setCodeError("");
                  setServerError("");
                }}
                className={`auth-input ${
                  codeError
                    ? "auth-input-error"
                    : ""
                }`}
                placeholder="Enter 6-digit code"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoFocus
                maxLength={6}
              />

              {codeError ? (
                <Text className="auth-error">
                  {codeError}
                </Text>
              ) : null}
            </View>

            {serverError ? (
              <View className="rounded-2xl bg-accent/10 px-4 py-3">
                <Text className="auth-helper">
                  {serverError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleVerify}
              disabled={isLoading}
              className={`auth-button ${
                isLoading
                  ? "auth-button-disabled"
                  : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator
                  color="#081126"
                />
              ) : (
                <Text className="auth-button-text">
                  Verify email
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={resendCode}
              disabled={isLoading}
              className="auth-secondary-button"
            >
              <Text className="auth-secondary-button-text">
                Resend code
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsVerifying(false);
                setCode("");
                setCodeError("");
                setServerError("");
              }}
              disabled={isLoading}
              className="items-center py-2"
            >
              <Text className="auth-helper">
                Change email or password
              </Text>
            </Pressable>

          </View>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing your subscriptions with confidence"
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
            placeholder="Create a password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError("");
              setServerError("");
            }}
            password
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            error={passwordError}
            onSubmitEditing={handleSignUp}
          />

          <Text className="auth-helper">
            Use at least 8 characters for a stronger password.
          </Text>

          {serverError ? (
            <View className="rounded-2xl bg-destructive/10 px-4 py-3">
              <Text className="auth-error">
                {serverError}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSignUp}
            disabled={isLoading}
            className={`auth-button ${
              isLoading
                ? "auth-button-disabled"
                : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator
                color="#081126"
              />
            ) : (
              <Text className="auth-button-text">
                Create account
              </Text>
            )}
          </Pressable>

        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">
            Already have an account?
          </Text>

          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
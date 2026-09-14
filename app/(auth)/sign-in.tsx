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
  View,
} from "react-native";

export default function SignIn() {
  const router = useRouter();

  const { isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [serverError, setServerError] =
    useState("");

  const isLoading =
    fetchStatus === "fetching";

  const validate = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setServerError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Please enter your email.");
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
        "Please enter your password."
      );
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async () => {
    if (isLoading || !validate()) {
      return;
    }

    try {
      const { error } =
        await signIn.password({
          emailAddress: email.trim().toLowerCase(),
          password,
        });

      if (error) {
        setServerError(
          getAuthError(error)
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();

        posthog?.capture("user_signed_in", {
          authentication_method: "password",
        });
        router.replace("/(tabs)");
        return;
      }

      if (
        signIn.status ===
        "needs_second_factor"
      ) {
        setServerError(
          "Additional verification is required for this account."
        );
        return;
      }

      if (
        signIn.status ===
        "needs_client_trust"
      ) {
        setServerError(
          "Please complete the device verification to continue."
        );
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

  if (isSignedIn) {
    return null;
  }

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
            <View className="rounded-2xl bg-destructive/10 px-4 py-3">
              <Text className="auth-error">
                {serverError}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSignIn}
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
                Sign in
              </Text>
            )}
          </Pressable>
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">
            New to LedgerFlow?
          </Text>

          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
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
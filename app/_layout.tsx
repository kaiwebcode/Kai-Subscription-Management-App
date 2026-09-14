import "./global.css";

import { posthog } from "@/lib/posthog";

import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SplashScreen, Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { SubscriptionProvider } from "@/context/SubscriptionContext";


const publishableKey: string =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file",
  );
}

function PostHogScreenTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog?.screen(pathname, {
        previous_screen: previousPathname.current,
      });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const email =
      user.primaryEmailAddress?.emailAddress;

    const firstName = user.firstName;
    const lastName = user.lastName;

    posthog?.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(firstName
          ? { first_name: firstName }
          : {}),
        ...(lastName
          ? { last_name: lastName }
          : {}),
      },
    });
  }, [isLoaded, user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const navigation = (
    <>
      <PostHogScreenTracker />
      <PostHogIdentity />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SubscriptionProvider>
        {posthog ? (
          <PostHogProvider client={posthog}>{navigation}</PostHogProvider>
        ) : (
          navigation
        )}
      </SubscriptionProvider>
    </ClerkProvider>
  );
}

import { posthog } from "@/lib/posthog";

import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const userName =
    userEmail
      ?.split("@")[0]
      ?.split(/[._-]/)[0]
      ?.replace(/^./, (char) => char.toUpperCase()) || "User";

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              await signOut();

              posthog?.capture("user_logged_out");
              posthog?.reset();
              router.replace("/(auth)/sign-in");
            } catch (error) {
              posthog?.captureException(error, {
                authentication_flow: "logout",
              });
              console.error("Logout error:", error);

              Alert.alert(
                "Logout failed",
                "Something went wrong. Please try again."
              );

              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-5">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-sans-bold text-primary">
            Settings
          </Text>

          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile */}
        <View className="rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
                <Text className="text-xl font-sans-bold text-white">
                  {userName.charAt(0)}
                </Text>
              </View>
            )}

            <View className="ml-4 min-w-0 flex-1">
              <Text
                className="text-xl font-sans-bold text-primary"
                numberOfLines={1}
              >
                {userName}
              </Text>

              <Text
                className="mt-1 text-sm font-sans-medium text-muted-foreground"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userEmail}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View className="mt-8">
          <Text className="mb-3 text-sm font-sans-bold uppercase tracking-[1px] text-muted-foreground">
            Account
          </Text>

          <View className="overflow-hidden rounded-3xl border border-border bg-card">
            <Pressable
              onPress={() => {
                posthog?.capture("account_details_opened");
                setShowAccountDetails(true);
              }}
              className="flex-row items-center justify-between px-5 py-5"
              android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            >
              <View className="flex-1">
                <Text className="text-base font-sans-semibold text-primary">
                  Account details
                </Text>

                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  Manage your account information
                </Text>
              </View>

              <Text className="ml-3 text-xl text-muted-foreground">
                ›
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <View className="mt-auto pb-24">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className={`items-center rounded-2xl border border-destructive/20 bg-destructive/10 py-4 ${
              isLoggingOut ? "opacity-50" : ""
            }`}
          >
            {isLoggingOut ? (
              <ActivityIndicator
                size="small"
                color="#dc2626"
              />
            ) : (
              <Text className="text-base font-sans-bold text-destructive">
                Log out
              </Text>
            )}
          </Pressable>

          <Text className="mt-3 text-center text-xs font-sans-medium text-muted-foreground">
            You can sign back in anytime.
          </Text>
        </View>
      </View>

      {/* ============================================================ */}
      {/* ACCOUNT DETAILS MODAL                                        */}
      {/* ============================================================ */}

      <Modal
        visible={showAccountDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountDetails(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[85%] rounded-t-3xl bg-background">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
              <Text className="text-xl font-sans-bold text-primary">
                Account details
              </Text>

              <Pressable
                onPress={() => setShowAccountDetails(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-muted"
                hitSlop={10}
              >
                <Text className="text-lg font-sans-bold text-primary">
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
              }}
            >
              {/* Large Avatar */}
              <View className="mb-7 items-center">
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-24 w-24 rounded-full"
                  />
                ) : (
                  <View className="h-24 w-24 items-center justify-center rounded-full bg-accent">
                    <Text className="text-3xl font-sans-bold text-white">
                      {userName.charAt(0)}
                    </Text>
                  </View>
                )}

                <Text className="mt-4 text-2xl font-sans-bold text-primary">
                  {userName}
                </Text>

                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  Account information
                </Text>
              </View>

              {/* Email */}
              <View className="mb-4 rounded-2xl border border-border bg-card p-4">
                <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                  Email
                </Text>

                <Text
                  className="mt-2 text-base font-sans-semibold text-primary"
                  numberOfLines={2}
                >
                  {userEmail || "Not available"}
                </Text>
              </View>

              {/* First Name */}
              <View className="mb-4 rounded-2xl border border-border bg-card p-4">
                <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                  First name
                </Text>

                <Text className="mt-2 text-base font-sans-semibold text-primary">
                  {user?.firstName || "Not set"}
                </Text>
              </View>

              {/* Last Name */}
              <View className="mb-4 rounded-2xl border border-border bg-card p-4">
                <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                  Last name
                </Text>

                <Text className="mt-2 text-base font-sans-semibold text-primary">
                  {user?.lastName || "Not set"}
                </Text>
              </View>

              {/* Account ID */}
              <View className="rounded-2xl border border-border bg-card p-4">
                <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                  Account ID
                </Text>

                <Text
                  className="mt-2 text-sm font-sans-medium text-primary"
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {user?.id || "Not available"}
                </Text>
              </View>

              {/* Close */}
              <Pressable
                onPress={() => setShowAccountDetails(false)}
                className="mt-6 items-center rounded-2xl bg-accent py-4"
              >
                <Text className="text-base font-sans-bold text-primary">
                  Done
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
import { posthog } from "@/lib/posthog";

import { useClerk, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  /*
   * Temporary selected avatar.
   *
   * This is only local until the user presses Save changes.
   */
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [removeAvatar, setRemoveAvatar] = useState(false);

  /*
   * Email
   */
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  /*
   * Fallback name from email.
   */
  const emailFallbackName =
    userEmail
      ?.split("@")[0]
      ?.split(/[._-]/)[0]
      ?.replace(/^./, (char) => char.toUpperCase()) || "";

  /*
   * Display name.
   *
   * Priority:
   *
   * First + Last
   * ↓
   * First name
   * ↓
   * Email fallback
   * ↓
   * User
   */
  const userName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || user?.firstName || emailFallbackName || "User";
  }, [user?.firstName, user?.lastName, emailFallbackName]);

  /*
   * Current avatar shown in the editor.
   */
  const currentAvatarUri =
    selectedImage?.uri || (!removeAvatar ? user?.imageUrl : undefined);

  /*
   * Responsive modal sizing.
   */
  const modalWidth = Math.min(screenWidth - 24, 520);

  const modalMaxHeight = Math.min(screenHeight * 0.9, 760);

  /*
   * Close account modal safely.
   */
  const closeAccountDetails = () => {
    if (isSavingProfile) {
      return;
    }

    setShowAccountDetails(false);
    setIsEditingProfile(false);
    setSelectedImage(null);
    setRemoveAvatar(false);
  };

  /*
   * Start editing.
   */
  const handleStartEditing = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");

    setSelectedImage(null);
    setRemoveAvatar(false);

    setIsEditingProfile(true);

    posthog?.capture("profile_edit_started");
  };

  /*
   * Cancel editing.
   */
  const handleCancelEditing = () => {
    if (isSavingProfile) {
      return;
    }

    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");

    setSelectedImage(null);
    setRemoveAvatar(false);

    setIsEditingProfile(false);

    posthog?.capture("profile_edit_cancelled");
  };

  /*
   * Pick avatar from gallery.
   */
  const handlePickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access required",
          "Please allow SubFlow to access your photos so you can choose a profile picture.",
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
        selectionLimit: 1,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets[0];

      setSelectedImage(image);
      setRemoveAvatar(false);

      posthog?.capture("profile_avatar_selected");
    } catch (error) {
      console.error("Avatar picker error:", error);

      posthog?.captureException(error, {
        authentication_flow: "profile_avatar_picker",
      });

      Alert.alert(
        "Unable to select image",
        "Something went wrong while selecting your photo.",
      );
    }
  };

  /*
   * Remove avatar.
   */
  const handleRemoveAvatar = () => {
    if (!user?.imageUrl && !selectedImage) {
      return;
    }

    Alert.alert(
      "Remove profile picture?",
      "Your profile picture will be removed from your Clerk account.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedImage(null);
            setRemoveAvatar(true);

            posthog?.capture("profile_avatar_remove_started");
          },
        },
      ],
    );
  };

  /*
   * Save profile.
   */
  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    const cleanedFirstName = firstName.trim();
    const cleanedLastName = lastName.trim();

    /*
     * First name is required.
     */
    if (!cleanedFirstName) {
      Alert.alert("First name required", "Please enter your first name.");

      return;
    }

    if (cleanedFirstName.length > 50) {
      Alert.alert(
        "First name too long",
        "First name must be 50 characters or less.",
      );

      return;
    }

    if (cleanedLastName.length > 50) {
      Alert.alert(
        "Last name too long",
        "Last name must be 50 characters or less.",
      );

      return;
    }

    try {
      setIsSavingProfile(true);

      /*
       * ------------------------------------------
       * UPDATE NAME
       * ------------------------------------------
       */
      await user.update({
        firstName: cleanedFirstName,
        lastName: cleanedLastName || undefined,
      });

      /*
       * ------------------------------------------
       * UPDATE AVATAR
       * ------------------------------------------
       */

      if (removeAvatar) {
        /*
         * Delete existing Clerk profile image.
         */
        await user.setProfileImage({
          file: null,
        });
      } else if (selectedImage?.base64) {
        /*
         * ImagePicker gives us base64.
         *
         * Clerk expects a valid image data URL.
         */
        const mimeType = selectedImage.mimeType || "image/jpeg";

        const imageData = `data:${mimeType};base64,${selectedImage.base64}`;

        await user.setProfileImage({
          file: imageData,
        });
      }

      /*
       * Reload latest Clerk user.
       */
      await user.reload();

      /*
       * Reset local editor state.
       */
      setSelectedImage(null);
      setRemoveAvatar(false);
      setIsEditingProfile(false);

      posthog?.capture("profile_updated", {
        has_first_name: Boolean(cleanedFirstName),
        has_last_name: Boolean(cleanedLastName),
        avatar_updated: Boolean(selectedImage || removeAvatar),
      });

      Alert.alert(
        "Profile updated",
        "Your account details have been updated successfully.",
      );
    } catch (error: any) {
      console.error("Profile update error:", error);

      posthog?.captureException(error, {
        authentication_flow: "profile_update",
      });

      const clerkMessage =
        error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;

      Alert.alert(
        "Update failed",
        clerkMessage ||
          "Something went wrong while updating your profile. Please try again.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  /*
   * Logout.
   */
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
                "Something went wrong. Please try again.",
              );

              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  /*
   * Loading state.
   */
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
        {/* ========================================= */}
        {/* HEADER                                    */}
        {/* ========================================= */}

        <View className="mb-8">
          <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            Manage your account and preferences
          </Text>
        </View>

        {/* ========================================= */}
        {/* PROFILE                                   */}
        {/* ========================================= */}

        <View className="rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center">
            {user?.imageUrl ? (
              <Image
                source={{
                  uri: user.imageUrl,
                }}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
                <Text className="text-xl font-sans-bold text-white">
                  {userName.charAt(0).toUpperCase()}
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

        {/* ========================================= */}
        {/* ACCOUNT                                   */}
        {/* ========================================= */}

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
              android_ripple={{
                color: "rgba(0,0,0,0.05)",
              }}
            >
              <View className="min-w-0 flex-1">
                <Text className="text-base font-sans-semibold text-primary">
                  Account details
                </Text>

                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  Manage your account information
                </Text>
              </View>

              <Text className="ml-3 text-xl text-muted-foreground">›</Text>
            </Pressable>
          </View>
        </View>

        {/* ========================================= */}
        {/* LOGOUT                                    */}
        {/* ========================================= */}

        <View className="mt-auto pb-24">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className={`items-center rounded-2xl border border-destructive/20 bg-destructive/10 py-4 ${
              isLoggingOut ? "opacity-50" : ""
            }`}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
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

      {/* ====================================================== */}
      {/* ACCOUNT DETAILS MODAL                                  */}
      {/* ====================================================== */}

      <Modal
        visible={showAccountDetails}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeAccountDetails}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 items-center justify-end px-3">
            {/* ================================================== */}
            {/* BACKDROP                                           */}
            {/* ================================================== */}

            <Pressable
              className="absolute inset-0 bg-black/55"
              onPress={closeAccountDetails}
              disabled={isSavingProfile}
            />

            {/* ================================================== */}
            {/* MODAL                                              */}
            {/* ================================================== */}

            <View
              style={{
                width: modalWidth,
                maxHeight: modalMaxHeight,
              }}
              className="overflow-hidden rounded-t-[28px] rounded-b-[28px] bg-background"
            >
              {/* ================================================ */}
              {/* MODAL HEADER                                      */}
              {/* ================================================ */}

              <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
                <View className="min-w-0 flex-1">
                  <Text className="text-xl font-sans-bold text-primary">
                    Account details
                  </Text>

                  <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
                    Manage your SubFlow profile
                  </Text>
                </View>

                <Pressable
                  onPress={closeAccountDetails}
                  disabled={isSavingProfile}
                  className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-muted"
                  hitSlop={10}
                >
                  <Text className="text-lg font-sans-bold text-primary">×</Text>
                </Pressable>
              </View>

              {/* ================================================ */}
              {/* CONTENT                                           */}
              {/* ================================================ */}

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 32,
                }}
              >
                {/* ============================================== */}
                {/* AVATAR                                          */}
                {/* ============================================== */}

                <View className="mb-7 items-center">
                  <View className="relative">
                    {currentAvatarUri ? (
                      <Image
                        source={{
                          uri: currentAvatarUri,
                        }}
                        className="h-28 w-28 rounded-full"
                      />
                    ) : (
                      <View className="h-28 w-28 items-center justify-center rounded-full bg-accent">
                        <Text className="text-4xl font-sans-bold text-white">
                          {userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    {/* Edit avatar button */}

                    {isEditingProfile && (
                      <Pressable
                        onPress={handlePickAvatar}
                        disabled={isSavingProfile}
                        className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-accent"
                      >
                        <Text className="text-base font-sans-bold text-primary">
                          ✎
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <Text className="mt-4 text-2xl font-sans-bold text-primary">
                    {userName}
                  </Text>

                  <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                    {isEditingProfile
                      ? "Update your profile"
                      : "Account information"}
                  </Text>

                  {/* Avatar actions */}

                  {isEditingProfile && (
                    <View className="mt-4 flex-row items-center">
                      <Pressable
                        onPress={handlePickAvatar}
                        disabled={isSavingProfile}
                        className="rounded-xl bg-accent px-4 py-2.5"
                      >
                        <Text className="text-sm font-sans-bold text-primary">
                          {currentAvatarUri ? "Change photo" : "Add photo"}
                        </Text>
                      </Pressable>

                      {currentAvatarUri && (
                        <Pressable
                          onPress={handleRemoveAvatar}
                          disabled={isSavingProfile}
                          className="ml-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5"
                        >
                          <Text className="text-sm font-sans-bold text-destructive">
                            Remove
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>

                {/* ================================================== */}
                {/* VIEW MODE                                           */}
                {/* ================================================== */}

                {!isEditingProfile ? (
                  <>
                    {/* Edit */}

                    <Pressable
                      onPress={handleStartEditing}
                      className="mb-5 items-center rounded-2xl bg-accent py-4"
                    >
                      <Text className="text-base font-sans-bold text-primary">
                        Edit profile
                      </Text>
                    </Pressable>

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

                    {/* First name */}

                    <View className="mb-4 rounded-2xl border border-border bg-card p-4">
                      <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                        First name
                      </Text>

                      <Text className="mt-2 text-base font-sans-semibold text-primary">
                        {user?.firstName || "Not set"}
                      </Text>
                    </View>

                    {/* Last name */}

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

                    {/* Done */}

                    <Pressable
                      onPress={closeAccountDetails}
                      className="mt-6 items-center rounded-2xl border border-border bg-card py-4"
                    >
                      <Text className="text-base font-sans-bold text-primary">
                        Done
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {/* ================================================= */}
                    {/* EDIT PROFILE                                       */}
                    {/* ================================================= */}

                    <View className="mb-5">
                      <Text className="text-base font-sans-bold text-primary">
                        Personal information
                      </Text>

                      <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                        Add your name so SubFlow can personalize your account.
                      </Text>
                    </View>

                    {/* First name */}

                    <View className="mb-4">
                      <Text className="mb-2 text-sm font-sans-semibold text-primary">
                        First name
                      </Text>

                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter your first name"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isSavingProfile}
                        returnKeyType="next"
                        className="rounded-2xl border border-border bg-card px-4 py-4 text-base font-sans-medium text-primary"
                      />
                    </View>

                    {/* Last name */}

                    <View className="mb-4">
                      <Text className="mb-2 text-sm font-sans-semibold text-primary">
                        Last name
                      </Text>

                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter your last name"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isSavingProfile}
                        returnKeyType="done"
                        onSubmitEditing={handleSaveProfile}
                        className="rounded-2xl border border-border bg-card px-4 py-4 text-base font-sans-medium text-primary"
                      />
                    </View>

                    {/* Email */}

                    <View className="mb-6 rounded-2xl border border-border bg-muted/30 p-4">
                      <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                        Email
                      </Text>

                      <Text
                        className="mt-2 text-base font-sans-medium text-muted-foreground"
                        numberOfLines={2}
                      >
                        {userEmail || "Not available"}
                      </Text>

                      <Text className="mt-2 text-xs font-sans-medium text-muted-foreground">
                        Email is managed through your authentication provider.
                      </Text>
                    </View>

                    {/* Save */}

                    <Pressable
                      onPress={handleSaveProfile}
                      disabled={isSavingProfile}
                      className={`mb-3 items-center rounded-2xl bg-accent py-4 ${
                        isSavingProfile ? "opacity-60" : ""
                      }`}
                    >
                      {isSavingProfile ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#111827" />

                          <Text className="ml-2 text-base font-sans-bold text-primary">
                            Saving...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-base font-sans-bold text-primary">
                          Save changes
                        </Text>
                      )}
                    </Pressable>

                    {/* Cancel */}

                    <Pressable
                      onPress={handleCancelEditing}
                      disabled={isSavingProfile}
                      className="items-center rounded-2xl border border-border bg-card py-4"
                    >
                      <Text className="text-base font-sans-bold text-primary">
                        Cancel
                      </Text>
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;

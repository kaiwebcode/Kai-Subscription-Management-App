import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
}: AuthShellProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {/* Brand */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              {/* SubFlow Logo Mark */}
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">
                  S
                </Text>
              </View>

              {/* Brand Name */}
              <View className="auth-brand-copy">
                <Text className="auth-wordmark">
                  Sub<Text className="auth-wordmark-accent">Flow</Text>
                </Text>

                <Text className="auth-wordmark-sub">
                  SUBSCRIPTION MANAGER
                </Text>
              </View>
            </View>

            {/* Screen Heading */}
            <Text className="auth-title">
              {title}
            </Text>

            <Text className="auth-subtitle">
              {subtitle}
            </Text>
          </View>

          {/* Screen Content */}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
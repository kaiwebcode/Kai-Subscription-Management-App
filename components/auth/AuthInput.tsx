import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  password?: boolean;
};

export default function AuthInput({
  label,
  error,
  password = false,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <View className="auth-field">
      <Text className="auth-label">
        {label}
      </Text>

      <View className="relative">
        <TextInput
          {...props}
          secureTextEntry={
            password && !showPassword
          }
          className={`auth-input ${
            error ? "auth-input-error" : ""
          }`}
          placeholderTextColor="rgba(0, 0, 0, 0.45)"
          autoCorrect={false}
        />

        {password && (
          <Pressable
            onPress={() =>
              setShowPassword((value) => !value)
            }
            className="absolute right-4 top-0 h-full items-center justify-center"
            hitSlop={10}
          >
            <Text className="text-sm font-sans-semibold text-muted-foreground">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text className="auth-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
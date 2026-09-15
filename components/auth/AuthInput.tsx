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
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(error);

  return (
    <View className="auth-field">
      {/* Label */}
      <View className="auth-label-row">
        <Text className="auth-label">
          {label}
        </Text>

        {password ? (
          <Text className="auth-secure-label">
            Secure
          </Text>
        ) : null}
      </View>

      {/* Input */}
      <View className="auth-input-wrap">
        <TextInput
          {...props}
          secureTextEntry={password && !showPassword}
          className={`auth-input ${
            password ? "auth-input-password" : ""
          } ${
            hasError ? "auth-input-error" : ""
          }`}
          placeholderTextColor="rgba(8, 17, 38, 0.42)"
          autoCorrect={false}
          autoCapitalize={
            password ? "none" : props.autoCapitalize
          }
          accessibilityLabel={label}
        />

        {/* Password Toggle */}
        {password ? (
          <Pressable
            onPress={() =>
              setShowPassword((value) => !value)
            }
            className="auth-password-toggle"
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            accessibilityState={{
              expanded: showPassword,
            }}
          >
            <Text className="auth-password-toggle-text">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Error */}
      {hasError ? (
        <View className="auth-error-wrap">
          <Text className="auth-error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
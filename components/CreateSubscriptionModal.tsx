import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f3c6d3",
  Cloud: "#c9d8f0",
  Music: "#f2c2a7",
  Other: "#ddd6c8",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreated,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");

  const [category, setCategory] = useState<Category>("Other");

  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName) {
      setError("Please enter a subscription name.");
      return;
    }

    if (!price.trim() || !Number.isFinite(numericPrice)) {
      setError("Please enter a valid price.");
      return;
    }

    if (numericPrice <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    const startDate = dayjs();

    const renewalDate =
      frequency === "Monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");

    const subscription: Subscription = {
      id: `subscription-${Date.now()}`,

      name: trimmedName,

      price: numericPrice,

      currency: "USD",

      frequency,

      billing: frequency,

      category,

      plan: `${frequency} Plan`,

      paymentMethod: "Not specified",

      status: "active",

      startDate: startDate.toISOString(),

      renewalDate: renewalDate.toISOString(),

      icon: icons.wallet,

      color: CATEGORY_COLORS[category],
    };

    /*
     * Analytics
     */
    posthog?.capture("subscription_created", {
      subscription_id: subscription.id,
      name: name.trim(),
      category: category,
      billing_interval: frequency,
      price: numericPrice,
    });

    /*
     * Update shared subscription state
     */
    onCreated(subscription);

    /*
     * Reset + close
     */
    resetForm();
    onClose();
  };

  const isValid =
    name.trim().length > 0 &&
    price.trim().length > 0 &&
    Number.isFinite(Number(price)) &&
    Number(price) > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[90%] rounded-t-3xl bg-background">
            {/* Header */}
            <View className="modal-header">
              <View className="flex-1">
                <Text className="modal-title">New Subscription</Text>

                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  Add a subscription to your account
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                className="modal-close"
                hitSlop={8}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: 32,
              }}
            >
              <View className="modal-body">
                {/* Name */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>

                  <TextInput
                    value={name}
                    onChangeText={(value) => {
                      setName(value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="e.g. Netflix"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    className="auth-input"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>

                {/* Price */}
                <View className="auth-field">
                  <Text className="auth-label">Price</Text>

                  <TextInput
                    value={price}
                    onChangeText={(value) => {
                      setPrice(value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="e.g. 15.99"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    className="auth-input"
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Frequency */}
                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>

                  <View className="picker-row">
                    {(["Monthly", "Yearly"] as const).map((option) => {
                      const active = frequency === option;

                      return (
                        <Pressable
                          key={option}
                          onPress={() => setFrequency(option)}
                          className={clsx(
                            "picker-option",
                            active && "picker-option-active",
                          )}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              active && "picker-option-text-active",
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Category */}
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>

                  <View className="category-scroll">
                    {CATEGORIES.map((option) => {
                      const active = category === option;

                      return (
                        <Pressable
                          key={option}
                          onPress={() => setCategory(option)}
                          className={clsx(
                            "category-chip",
                            active && "category-chip-active",
                          )}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              active && "category-chip-text-active",
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Error */}
                {error ? (
                  <View className="auth-server-error">
                    <Text className="auth-error">{error}</Text>
                  </View>
                ) : null}

                {/* Submit */}
                <Pressable
                  disabled={!isValid}
                  onPress={handleSubmit}
                  className={clsx(
                    "auth-button",
                    !isValid && "auth-button-disabled",
                  )}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

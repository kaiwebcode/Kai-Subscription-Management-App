import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import clsx from "clsx";
import { Image, Pressable, Text, View } from "react-native";

export default function SubscriptionCard({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) {
  const displayMeta =
    category?.trim() ||
    plan?.trim() ||
    (renewalDate
      ? formatSubscriptionDateTime(renewalDate)
      : "");

  const displayPayment =
    paymentMethod?.trim() || "Not specified";

  const displayCategory =
    category?.trim() || "Not specified";

  const displayStartDate = startDate
    ? formatSubscriptionDateTime(startDate)
    : "Not specified";

  const displayRenewalDate = renewalDate
    ? formatSubscriptionDateTime(renewalDate)
    : "Not specified";

  const displayStatus = status
    ? formatStatusLabel(status)
    : "Not specified";

  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "sub-card mb-3",
        expanded ? "sub-card-expanded" : "bg-card"
      )}
      style={
        !expanded && color
          ? { backgroundColor: color }
          : undefined
      }
    >
      {/* Main subscription information */}
      <View className="sub-head">
        <View className="sub-main">
          <Image
            source={icon}
            className="sub-icon"
          />

          <View className="sub-copy">
            <Text
              className="sub-title"
              numberOfLines={1}
            >
              {name}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="sub-meta"
            >
              {displayMeta}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">
            {formatCurrency(price, currency)}
          </Text>

          <Text className="sub-currency">
            {billing}
          </Text>
        </View>
      </View>

      {/* Expanded subscription details */}
      {expanded ? (
        <View className="sub-body">
          <View className="sub-details">
            {/* Payment */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">
                  Payment:
                </Text>

                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayPayment}
                </Text>
              </View>
            </View>

            {/* Category */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">
                  Category:
                </Text>

                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayCategory}
                </Text>
              </View>
            </View>

            {/* Started */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">
                  Started:
                </Text>

                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayStartDate}
                </Text>
              </View>
            </View>

            {/* Renewal date */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">
                  Renewal date:
                </Text>

                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayRenewalDate}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">
                  Status:
                </Text>

                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
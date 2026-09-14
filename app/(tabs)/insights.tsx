
import { useSubscriptions } from "@/context/SubscriptionContext";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChartItem = {
  day: string;
  amount: number;
  highlighted?: boolean;
};

const CHART_DATA: ChartItem[] = [
  { day: "Mon", amount: 36 },
  { day: "Tue", amount: 31 },
  { day: "Wed", amount: 23 },
  { day: "Thu", amount: 40, highlighted: true },
  { day: "Fri", amount: 34 },
  { day: "Sat", amount: 21 },
  { day: "Sun", amount: 24 },
];

const CHART_MAX = 45;

const FALLBACK_COLORS = [
  "#F9D64A",
  "#A7D9CB",
  "#E8DEF8",
  "#B8D4E3",
];

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatBilling(billing?: string) {
  return billing?.toLowerCase() === "yearly"
    ? "per year"
    : "per month";
}

export default function Insights() {
  const { subscriptions } = useSubscriptions();
  const { width } = useWindowDimensions();

  const chartWidth = Math.max(width - 32, 280);

  const monthlyExpenses = useMemo(() => {
    return subscriptions.reduce((total, subscription) => {
      const isYearly =
        subscription.billing?.toLowerCase() === "yearly";

      return (
        total +
        subscription.price / (isYearly ? 12 : 1)
      );
    }, 0);
  }, [subscriptions]);

  const historySubscriptions = useMemo(() => {
    return [...subscriptions]
      .sort(
        (a, b) =>
          new Date(b.renewalDate).getTime() -
          new Date(a.renewalDate).getTime()
      )
      .slice(0, 5);
  }, [subscriptions]);

  const monthLabel = useMemo(() => {
    if (subscriptions.length === 0) {
      return "March 2026";
    }

    const latest = subscriptions
      .map((subscription) => new Date(subscription.renewalDate))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (!latest) {
      return "March 2026";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(latest);
  }, [subscriptions]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={historySubscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
        )}
        ListHeaderComponent={
          <View>
            {/* ================= HEADER ================= */}

            <View className="insights-header">
              <Pressable
                onPress={handleBack}
                className="insights-circle-button"
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-back"
                  size={25}
                  color="#081126"
                />
              </Pressable>

              <Text
                className="insights-title"
                numberOfLines={1}
              >
                Monthly Insights
              </Text>

              <Pressable
                className="insights-circle-button"
                hitSlop={8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={23}
                  color="#081126"
                />
              </Pressable>
            </View>

            {/* ================= UPCOMING ================= */}

            <View className="insights-section-header">
              <Text className="insights-section-title">
                Upcoming
              </Text>

              <Pressable
                className="insights-view-all"
                onPress={() =>
                  router.push("/(tabs)/subscriptions")
                }
              >
                <Text className="insights-view-all-text">
                  View all
                </Text>
              </Pressable>
            </View>

            {/* ================= CHART ================= */}

            <View
              className="insights-chart-card"
              style={{ width: chartWidth }}
            >
              {/* horizontal guides */}
              <View className="insights-chart-grid">
                {["45", "35", "25", "15", "0"].map(
                  (value, index) => (
                    <View
                      key={value}
                      className="insights-chart-grid-row"
                      style={{
                        top:
                          index === 0
                            ? 0
                            : index === 4
                              ? undefined
                              : `${index * 25}%`,
                        bottom:
                          index === 4
                            ? 0
                            : undefined,
                      }}
                    >
                      <Text className="insights-grid-label">
                        {value}
                      </Text>

                      {index !== 4 && (
                        <View className="insights-grid-line" />
                      )}
                    </View>
                  )
                )}
              </View>

              {/* bars */}
              <View className="insights-bars">
                {CHART_DATA.map((item) => {
                  const barHeight = Math.max(
                    18,
                    (item.amount / CHART_MAX) * 166
                  );

                  return (
                    <View
                      key={item.day}
                      className="insights-bar-column"
                    >
                      <View className="insights-bar-wrapper">
                        {item.highlighted && (
                          <View className="insights-tooltip">
                            <Text className="insights-tooltip-text">
                              ${item.amount}
                            </Text>

                            <View className="insights-tooltip-arrow" />
                          </View>
                        )}

                        <View
                          className={
                            item.highlighted
                              ? "insights-bar insights-bar-active"
                              : "insights-bar"
                          }
                          style={{
                            height: barHeight,
                          }}
                        />
                      </View>

                      <Text className="insights-day">
                        {item.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ================= EXPENSE SUMMARY ================= */}

            <View className="insights-expense-card">
              <View className="insights-expense-left">
                <Text className="insights-expense-title">
                  Expenses
                </Text>

                <Text className="insights-expense-month">
                  {monthLabel}
                </Text>
              </View>

              <View className="insights-expense-right">
                <Text
                  className="insights-expense-value"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  -{formatCurrency(monthlyExpenses, "USD")}
                </Text>

                <View className="insights-change-row">
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color="#40506B"
                  />

                  <Text className="insights-expense-change">
                    +12%
                  </Text>
                </View>
              </View>
            </View>

            {/* ================= HISTORY ================= */}

            <View className="insights-section-header insights-history-header">
              <Text className="insights-section-title">
                History
              </Text>

              <Pressable
                className="insights-view-all"
                onPress={() =>
                  router.push("/(tabs)/subscriptions")
                }
              >
                <Text className="insights-view-all-text">
                  View all
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            className="insights-history-card"
            style={{
              backgroundColor:
                item.color ||
                FALLBACK_COLORS[
                  index % FALLBACK_COLORS.length
                ],
            }}
            onPress={() =>
              router.push("/(tabs)/subscriptions")
            }
          >
            {/* icon */}
            <View className="insights-history-icon">
              {item.icon ? (
                <Image
                  source={item.icon}
                  className="insights-history-image"
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="wallet-outline"
                  size={27}
                  color="#081126"
                />
              )}
            </View>

            {/* content */}
            <View className="insights-history-content">
              <Text
                className="insights-history-name"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                className="insights-history-date"
                numberOfLines={1}
              >
                {formatDate(item.renewalDate)}
              </Text>
            </View>

            {/* price */}
            <View className="insights-history-price">
              <Text
                className="insights-history-amount"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatCurrency(
                  item.price,
                  item.currency
                )}
              </Text>

              <Text className="insights-history-billing">
                {formatBilling(item.billing)}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="insights-empty">
            <View className="insights-empty-icon">
              <Ionicons
                name="bar-chart-outline"
                size={30}
                color="#081126"
              />
            </View>

            <Text className="insights-empty-title">
              No insights yet
            </Text>

            <Text className="insights-empty-text">
              Add your subscriptions to see your
              spending insights here.
            </Text>

            <Pressable
              className="insights-empty-button"
              onPress={() =>
                router.push("/(tabs)/subscriptions")
              }
            >
              <Text className="insights-empty-button-text">
                Add subscription
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionContext";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SubscriptionFilter =
  | "all"
  | "active"
  | "paused"
  | "cancelled";

export default function Subscription() {
  /*
   * IMPORTANT:
   * Read subscriptions from the shared context.
   *
   * Do NOT create another local subscriptions state here.
   */
  const { subscriptions } = useSubscriptions();

  const [filter, setFilter] =
    useState<SubscriptionFilter>("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  /*
   * Search + status filtering
   */
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesStatus =
        filter === "all" ||
        subscription.status === filter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        subscription.name,
        subscription.category,
        subscription.plan,
        subscription.billing,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        );
    });
  }, [subscriptions, filter, searchQuery]);

  /*
   * Subscription counts
   */
  const counts = useMemo(() => {
    let active = 0;
    let paused = 0;
    let cancelled = 0;

    for (const subscription of subscriptions) {
      if (subscription.status === "active") {
        active++;
      } else if (subscription.status === "paused") {
        paused++;
      } else if (subscription.status === "cancelled") {
        cancelled++;
      }
    }

    return {
      all: subscriptions.length,
      active,
      paused,
      cancelled,
    };
  }, [subscriptions]);

  const handleFilterChange = (
    nextFilter: SubscriptionFilter
  ) => {
    setFilter(nextFilter);
    setExpandedId(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim()) {
      setExpandedId(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background px-5"
      edges={["top", "left", "right"]}
    >
      <View className="flex-1">

        {/* Header */}
        <View className="mb-5">
          <Text className="text-3xl font-sans-bold text-primary">
            Subscriptions
          </Text>

          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            Manage all your subscriptions
          </Text>
        </View>

        {/* Search */}
        <View className="mb-5">
          <View className="relative">
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search subscriptions..."
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              className="h-14 rounded-2xl border border-border bg-card px-4 pr-12 text-base font-sans-medium text-primary"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            {searchQuery.length > 0 ? (
              <Pressable
                onPress={clearSearch}
                hitSlop={10}
                className="absolute right-4 top-0 h-14 w-8 items-center justify-center"
              >
                <Text className="text-xl font-sans-bold text-muted-foreground">
                  ×
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Summary cards */}
        <View className="mb-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-border bg-card p-4">
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              Total
            </Text>

            <Text className="mt-1 text-2xl font-sans-bold text-primary">
              {counts.all}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-border bg-card p-4">
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              Active
            </Text>

            <Text className="mt-1 text-2xl font-sans-bold text-primary">
              {counts.active}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-border bg-card p-4">
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              Paused
            </Text>

            <Text className="mt-1 text-2xl font-sans-bold text-primary">
              {counts.paused}
            </Text>
          </View>
        </View>

        {/* Status filters */}
        <View className="mb-5">
          <FlatList
            horizontal
            data={[
              ["all", "All"],
              ["active", "Active"],
              ["paused", "Paused"],
              ["cancelled", "Cancelled"],
            ] as const}
            keyExtractor={([value]) => value}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
            }}
            renderItem={({ item: [value, label] }) => {
              const active = filter === value;

              return (
                <Pressable
                  onPress={() =>
                    handleFilterChange(value)
                  }
                  className={clsx(
                    "category-chip",
                    active &&
                      "category-chip-active"
                  )}
                >
                  <Text
                    className={clsx(
                      "category-chip-text",
                      active &&
                        "category-chip-text-active"
                    )}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Result information */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-sans-bold text-primary">
            {searchQuery.trim()
              ? "Search Results"
              : "All Subscriptions"}
          </Text>

          <Text className="text-sm font-sans-semibold text-muted-foreground">
            {filteredSubscriptions.length}
          </Text>
        </View>

        {/* Subscription list */}
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 4,
            paddingBottom: 32,
            flexGrow:
              filteredSubscriptions.length === 0
                ? 1
                : undefined,
          }}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId((current) =>
                  current === item.id
                    ? null
                    : item.id
                )
              }
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-16">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-card">
                <Text className="text-2xl">
                  {searchQuery.trim() ? "⌕" : "○"}
                </Text>
              </View>

              <Text className="text-lg font-sans-bold text-primary">
                {searchQuery.trim()
                  ? "No subscriptions found"
                  : "No subscriptions yet"}
              </Text>

              <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground">
                {searchQuery.trim()
                  ? `We couldn't find anything matching "${searchQuery.trim()}".`
                  : "Your subscriptions will appear here."}
              </Text>

              {searchQuery.trim() ? (
                <Pressable
                  onPress={clearSearch}
                  className="mt-5 rounded-full bg-accent px-5 py-3"
                >
                  <Text className="font-sans-bold text-primary">
                    Clear Search
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

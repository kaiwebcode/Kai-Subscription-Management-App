import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubsciption from "@/components/UpcomingSubscriptionCard";

import {
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";

import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/SubscriptionContext";

import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";

import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const {
    subscriptions,
    addSubscription,
  } = useSubscriptions();

  const [expandedSubscriptionId, setExpandedSubscriptionId] =
    useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const { isLoaded, user } = useUser();

  /*
   * Clerk user
   */
  const userName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress
      ?.split("@")[0]
      ?.split(/[._-]/)[0] ||
    "User";

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const userAvatar = user?.imageUrl;

  /*
   * Wait for Clerk
   */
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator
          size="small"
          color="#ea7a53"
        />
      </SafeAreaView>
    );
  }

  /*
   * Handle new subscription
   */
  const handleSubscriptionCreated = (
    subscription: Subscription
  ) => {
    addSubscription(subscription);

    /*
     * Make sure the new card can immediately
     * be seen in the list.
     */
    setExpandedSubscriptionId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background mb-10">
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        extraData={expandedSubscriptionId}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-4" />
        )}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="home-header">
  <View className="home-user">
    {userAvatar ? (
      <Image
        source={{ uri: userAvatar }}
        className="home-avatar"
      />
    ) : (
      <View className="home-avatar items-center justify-center bg-accent">
        <Text className="text-xl font-sans-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </Text>
      </View>
    )}

    <View className="home-user-copy">
      <Text
        className="home-user-name"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {userName}
      </Text>

      <Text
        className="home-user-email"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {user?.primaryEmailAddress?.emailAddress ?? ""}
      </Text>
    </View>
  </View>

  <Pressable
    onPress={() => setShowCreateModal(true)}
    className="home-add-button"
    hitSlop={8}
  >
    <Image
      source={icons.add}
      className="home-add-icon"
    />
  </Pressable>
</View>

            {/* Balance */}
            <View className="home-balance-card">
              <Text className="home-balance-label">
                Balance
              </Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(
                    HOME_BALANCE.amount
                  )}
                </Text>

                <Text className="home-balance-date">
                  {dayjs(
                    HOME_BALANCE.nextRenewalDate
                  ).format("MM/DD")}
                </Text>
              </View>
            </View>

            {/* Upcoming */}
            <View className="mb-2">
              <ListHeading title="Upcoming" />

              <FlatList
                ListHeaderComponent={
                  <View className="h-4" />
                }
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubsciption
                    {...item}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* All subscriptions */}
            <View className="mt-4 mb-4">
              <ListHeading title="All Subscriptions" />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={
              expandedSubscriptionId === item.id
            }
            onPress={() =>
              setExpandedSubscriptionId(
                (currentId) => {
                  const isOpening =
                    currentId !== item.id;

                  if (isOpening) {
                    posthog?.capture(
                      "subscription_details_opened",
                      {
                        subscription_id:
                          item.id,
                        billing_interval:
                          item.billing,
                        category:
                          item.category,
                        status:
                          item.status,
                      }
                    );
                  }

                  return isOpening
                    ? item.id
                    : null;
                }
              )
            }
          />
        )}
        ListEmptyComponent={
          <Text className="home-empty-state text-center">
            No subscriptions yet.
          </Text>
        }
      />

      {/* Create subscription modal */}
      <CreateSubscriptionModal
        visible={showCreateModal}
        onClose={() =>
          setShowCreateModal(false)
        }
        onCreated={handleSubscriptionCreated}
      />
    </SafeAreaView>
  );
}
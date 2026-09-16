import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#EE7854",
  backgroundDark: "#E86743",
  white: "#FFFFFF",
  ink: "#202437",
  muted: "rgba(255,255,255,0.76)",
  soft: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.20)",
};

const LOGO = require("../assets/icons/New-logo-Subflow.png");

const SLIDES = [
  {
    id: "welcome",
    eyebrow: "WELCOME TO SUBFLOW",
    title: "Your subscriptions,\nall in one place.",
    description:
      "Keep every recurring payment organized, visible and easy to manage.",
    icon: "wallet-outline" as const,
  },
  {
    id: "clarity",
    eyebrow: "FINANCIAL CLARITY",
    title: "Know where your\nmoney goes.",
    description:
      "Track your subscriptions and understand your recurring expenses at a glance.",
    icon: "pie-chart-outline" as const,
  },
  {
    id: "discover",
    eyebrow: "SMARTER SPENDING",
    title: "Discover your\nspending habits.",
    description:
      "See recurring payments clearly and stay aware of what you're paying for.",
    icon: "calendar-outline" as const,
  },
  {
    id: "control",
    eyebrow: "YOUR MONEY, YOUR CONTROL",
    title: "Make every\npayment count.",
    description:
      "Take control of your subscriptions and build better spending habits.",
    icon: "checkmark-circle-outline" as const,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);

  const listRef = useRef<FlatList>(null);

  const entrance = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const isCompact = height < 720;
  const isVeryCompact = height < 650;
  const isNarrow = width < 360;
  const isTablet = width >= 600;

  const horizontalPadding = isTablet ? 48 : isNarrow ? 20 : 24;

  const artworkHeight = Math.min(
    height * (isVeryCompact ? 0.34 : isCompact ? 0.39 : 0.43),
    width * (isTablet ? 0.7 : 0.95),
    isVeryCompact ? 275 : isCompact ? 315 : 375,
  );

  const titleSize = Math.min(
    isNarrow ? 29 : width * 0.082,
    isCompact ? 34 : 39,
  );

  const subtitleSize = isNarrow ? 14 : 15.5;

  useEffect(() => {
    entrance.setValue(0);

    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [activeIndex, entrance]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -7,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [float]);

  const goToSlide = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, SLIDES.length - 1));

    listRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });

    setActiveIndex(nextIndex);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);

    setActiveIndex(Math.max(0, Math.min(index, SLIDES.length - 1)));
  };

  const handleContinue = () => {
    if (activeIndex < SLIDES.length - 1) {
      goToSlide(activeIndex + 1);
      return;
    }

    router.push("/(auth)/sign-in");
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.965,
      speed: 25,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 25,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Reusable central artwork.
   * The logo is NOT used here.
   */
  const renderArtwork = (index: number) => {
    if (index === 0) {
      return (
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: entrance,
            transform: [
              {
                translateY: Animated.add(
                  entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                  float,
                ),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
                }),
              },
            ],
          }}
        >
          {/* Background glow */}
          <View
            style={{
              position: "absolute",
              width: 245,
              height: 245,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.055)",
            }}
          />

          {/* Main glass panel */}
          <View
            style={{
              width: Math.min(width * 0.78, 315),
              height: isCompact ? 220 : 245,
              borderRadius: 32,
              padding: 20,
              backgroundColor: "rgba(255,255,255,0.13)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 14,
              },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 7,
            }}
          >
            {/* Mini top bar */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.58)",
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 10,
                  }}
                >
                  MONTHLY SPENDING
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    color: COLORS.white,
                    fontFamily: "PlusJakartaSans-Bold",
                    fontSize: 23,
                    letterSpacing: -0.8,
                  }}
                >
                  ₹2,840
                </Text>
              </View>

              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  width: 42,
                  height: 42,
                  backgroundColor: COLORS.white,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={21}
                  color={COLORS.background}
                />
              </View>
            </View>

            {/* Subscription cards */}
            <View
              style={{
                marginTop: 20,
                gap: 9,
              }}
            >
              {[
                ["Netflix", "₹649"],
                ["Spotify", "₹119"],
                ["Adobe", "₹1,675"],
              ].map(([name, price], i) => (
                <View
                  key={name}
                  className="flex-row items-center justify-between"
                  style={{
                    height: 38,
                    paddingHorizontal: 11,
                    borderRadius: 12,
                    backgroundColor:
                      i === 0
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(255,255,255,0.09)",
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="items-center justify-center rounded-lg"
                      style={{
                        width: 25,
                        height: 25,
                        backgroundColor: "rgba(255,255,255,0.18)",
                      }}
                    >
                      <Ionicons
                        name="play-outline"
                        size={12}
                        color={COLORS.white}
                      />
                    </View>

                    <Text
                      style={{
                        marginLeft: 8,
                        color: COLORS.white,
                        fontFamily: "PlusJakartaSans-SemiBold",
                        fontSize: 11,
                      }}
                    >
                      {name}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      fontFamily: "PlusJakartaSans-SemiBold",
                      fontSize: 10,
                    }}
                  >
                    {price}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      );
    }

    if (index === 1) {
      return (
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: entrance,
            transform: [
              {
                translateY: Animated.add(
                  entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                  float,
                ),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.045)",
            }}
          />

          {/* Chart card */}
          <View
            style={{
              width: Math.min(width * 0.76, 300),
              height: isCompact ? 225 : 250,
              borderRadius: 30,
              padding: 21,
              backgroundColor: "rgba(255,255,255,0.13)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 14,
              },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 7,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.58)",
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 10,
                  }}
                >
                  SPENDING OVERVIEW
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    color: COLORS.white,
                    fontFamily: "PlusJakartaSans-Bold",
                    fontSize: 22,
                  }}
                >
                  ₹4,280
                </Text>
              </View>

              <Ionicons
                name="pie-chart-outline"
                size={28}
                color={COLORS.white}
              />
            </View>

            {/* Fake chart */}
            <View
              className="flex-row items-end justify-between"
              style={{
                height: 110,
                marginTop: 17,
              }}
            >
              {[42, 68, 52, 88, 62, 96, 73].map((bar, i) => (
                <View
                  key={i}
                  style={{
                    width: 19,
                    height: bar,
                    borderRadius: 7,
                    backgroundColor:
                      i === 5 ? COLORS.white : "rgba(255,255,255,0.28)",
                  }}
                />
              ))}
            </View>

            <View
              className="flex-row items-center"
              style={{
                marginTop: 12,
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  backgroundColor: COLORS.white,
                }}
              />

              <Text
                style={{
                  marginLeft: 7,
                  color: "rgba(255,255,255,0.68)",
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 10,
                }}
              >
                Recurring expenses
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    if (index === 2) {
      return (
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: entrance,
            transform: [
              {
                translateY: Animated.add(
                  entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                  float,
                ),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              width: Math.min(width * 0.78, 305),
              height: isCompact ? 225 : 250,
              borderRadius: 30,
              padding: 20,
              backgroundColor: "rgba(255,255,255,0.13)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.22)",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 14,
              },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 7,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.58)",
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 10,
                  }}
                >
                  UPCOMING PAYMENTS
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    color: COLORS.white,
                    fontFamily: "PlusJakartaSans-Bold",
                    fontSize: 20,
                  }}
                >
                  This week
                </Text>
              </View>

              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  width: 43,
                  height: 43,
                  backgroundColor: COLORS.white,
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={21}
                  color={COLORS.background}
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 18,
                gap: 9,
              }}
            >
              {[
                ["12", "Netflix", "₹649"],
                ["15", "Spotify", "₹119"],
                ["18", "Adobe", "₹1,675"],
              ].map(([date, name, price]) => (
                <View
                  key={name}
                  className="flex-row items-center"
                  style={{
                    height: 42,
                    paddingHorizontal: 9,
                    borderRadius: 13,
                    backgroundColor: "rgba(255,255,255,0.09)",
                  }}
                >
                  <View
                    className="items-center justify-center rounded-xl"
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontFamily: "PlusJakartaSans-Bold",
                        fontSize: 11,
                      }}
                    >
                      {date}
                    </Text>
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 9,
                      color: COLORS.white,
                      fontFamily: "PlusJakartaSans-SemiBold",
                      fontSize: 11,
                    }}
                  >
                    {name}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.68)",
                      fontFamily: "PlusJakartaSans-SemiBold",
                      fontSize: 10,
                    }}
                  >
                    {price}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: entrance,
          transform: [
            {
              translateY: Animated.add(
                entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
                float,
              ),
            },
            {
              scale: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.88, 1],
              }),
            },
          ],
        }}
      >
        <View
          style={{
            width: Math.min(width * 0.76, 300),
            height: isCompact ? 220 : 245,
            borderRadius: 30,
            padding: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.13)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.22)",

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 14,
            },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 7,
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 82,
              height: 82,
              backgroundColor: COLORS.white,
            }}
          >
            <Ionicons name="checkmark" size={43} color={COLORS.background} />
          </View>

          <Text
            style={{
              marginTop: 17,
              color: COLORS.white,
              fontFamily: "PlusJakartaSans-Bold",
              fontSize: 20,
              letterSpacing: -0.5,
            }}
          >
            You're in control
          </Text>

          <Text
            style={{
              marginTop: 5,
              color: "rgba(255,255,255,0.64)",
              fontFamily: "PlusJakartaSans-Medium",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            Every subscription. Every payment.
          </Text>

          <View
            className="flex-row items-center rounded-full"
            style={{
              marginTop: 17,
              paddingHorizontal: 13,
              paddingVertical: 7,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={COLORS.white}
            />

            <Text
              style={{
                marginLeft: 6,
                color: COLORS.white,
                fontFamily: "PlusJakartaSans-SemiBold",
                fontSize: 10,
              }}
            >
              Stay organized
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: COLORS.background,
      }}
    >
      <StatusBar style="light" />

      {/* ================================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ================================================= */}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 1.25,
          height: width * 1.25,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.025)",
          top: -width * 0.65,
          right: -width * 0.55,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 0.85,
          height: width * 0.85,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.045)",
          bottom: -width * 0.45,
          left: -width * 0.4,
        }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <View
            className="flex-row items-center justify-between"
            style={{
              paddingHorizontal: horizontalPadding,
              paddingTop: isCompact ? 3 : 12,
              paddingBottom: 7,
            }}
          >
            <View className="flex-row items-center">
              {/* ONLY PLACE WHERE THE LOGO IS USED */}
              <View
                className="items-center justify-center rounded-xl"
                style={{
                  width: 40,
                  height: 40,
                  // backgroundColor: COLORS.white,

                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 7,
                  elevation: 3,
                }}
              >
                <Image
                  source={LOGO}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={200}
                  style={{
                    width: 35,
                    height: 35,
                  }}
                />
              </View>

              <View style={{ marginLeft: 9 }}>
                <Text
                  style={{
                    color: COLORS.white,
                    fontFamily: "PlusJakartaSans-Bold",
                    fontSize: 18,
                    letterSpacing: -0.7,
                  }}
                >
                  SubFlow
                </Text>

                <Text
                  style={{
                    marginTop: -1,
                    color: "rgba(255,255,255,0.58)",
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 8,
                    letterSpacing: 0.65,
                  }}
                >
                  SUBSCRIPTIONS, SIMPLIFIED
                </Text>
              </View>
            </View>

            {activeIndex !== SLIDES.length - 1 && (
              <Pressable
                onPress={() => goToSlide(SLIDES.length - 1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  paddingVertical: 7,
                  paddingHorizontal: 3,
                })}
              >
                <Text
                  style={{
                    color: COLORS.muted,
                    fontFamily: "PlusJakartaSans-SemiBold",
                    fontSize: 13,
                  }}
                >
                  Skip
                </Text>
              </Pressable>
            )}
          </View>

          {/* ================================================= */}
          {/* SLIDES */}
          {/* ================================================= */}

          <FlatList
            ref={listRef}
            data={SLIDES}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={handleScrollEnd}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            style={{
              flex: 1,
            }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  width,
                  flex: 1,
                  paddingHorizontal: horizontalPadding,
                }}
              >
                {/* ARTWORK */}

                <View
                  style={{
                    height: artworkHeight,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderArtwork(index)}
                </View>

                {/* TEXT */}

                <Animated.View
                  className="flex-1 items-center"
                  style={{
                    opacity: entrance,
                    transform: [
                      {
                        translateY: entrance.interpolate({
                          inputRange: [0, 1],
                          outputRange: [16, 0],
                        }),
                      },
                    ],
                    paddingTop: isCompact ? 2 : 8,
                  }}
                >
                  {/* Eyebrow */}

                  <View
                    className="flex-row items-center rounded-full"
                    style={{
                      paddingHorizontal: 11,
                      paddingVertical: 6,
                      backgroundColor: "rgba(255,255,255,0.09)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.14)",
                    }}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={11}
                      color={COLORS.white}
                    />

                    <Text
                      style={{
                        marginLeft: 6,
                        color: COLORS.white,
                        fontFamily: "PlusJakartaSans-SemiBold",
                        fontSize: 9.5,
                        letterSpacing: 0.7,
                      }}
                    >
                      {item.eyebrow}
                    </Text>
                  </View>

                  {/* Title */}

                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    style={{
                      width: "100%",
                      maxWidth: 440,
                      marginTop: 13,
                      textAlign: "center",
                      color: COLORS.white,
                      fontFamily: "PlusJakartaSans-Bold",
                      fontSize: titleSize,
                      lineHeight: titleSize * 1.12,
                      letterSpacing: -1.15,
                    }}
                  >
                    {item.title}
                  </Text>

                  {/* Description */}

                  <Text
                    style={{
                      maxWidth: 350,
                      marginTop: 9,
                      textAlign: "center",
                      color: COLORS.muted,
                      fontFamily: "PlusJakartaSans-Medium",
                      fontSize: subtitleSize,
                      lineHeight: subtitleSize * 1.48,
                    }}
                  >
                    {item.description}
                  </Text>
                </Animated.View>
              </View>
            )}
          />

          {/* ================================================= */}
          {/* BOTTOM */}
          {/* ================================================= */}

          <View
            style={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 5,
              paddingBottom: isVeryCompact ? 3 : isCompact ? 5 : 9,
            }}
          >
            {/* Progress */}

            <View
              className="flex-row items-center justify-center"
              style={{
                marginBottom: isCompact ? 13 : 16,
              }}
            >
              {SLIDES.map((slide, index) => {
                const active = activeIndex === index;

                return (
                  <Pressable
                    key={slide.id}
                    onPress={() => goToSlide(index)}
                    hitSlop={8}
                    style={{
                      width: active ? 28 : 7,
                      height: 7,
                      borderRadius: 99,
                      marginHorizontal: 4,
                      backgroundColor: active
                        ? COLORS.white
                        : "rgba(255,255,255,0.30)",
                    }}
                  />
                );
              })}
            </View>

            {/* CTA */}

            {/* ================================================= */}
            {/* CTA */}
            {/* ================================================= */}

            <Animated.View
              style={{
                width: "100%",
                maxWidth: 460,
                alignSelf: "center",
                transform: [{ scale: buttonScale }],
              }}
            >
              <Pressable
                onPress={handleContinue}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={
                  activeIndex === SLIDES.length - 1
                    ? "Create account"
                    : "Continue"
                }
                style={{
                  width: "100%",
                  height: isCompact ? 54 : 60,
                  borderRadius: 999,
                  backgroundColor: COLORS.white,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",

                  elevation: 5,

                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.13,
                  shadowRadius: 9,
                }}
              >
                <Text
                  style={{
                    color: COLORS.ink,
                    fontFamily: "PlusJakartaSans-Bold",
                    fontSize: 16,
                  }}
                >
                  {activeIndex === SLIDES.length - 1
                    ? "Get Started"
                    : "Continue"}
                </Text>

                <Ionicons
                  name={
                    activeIndex === SLIDES.length - 1
                      ? "arrow-forward"
                      : "chevron-forward"
                  }
                  size={19}
                  color={COLORS.background}
                  style={{
                    marginLeft: 8,
                  }}
                />
              </Pressable>
            </Animated.View>

            {/* Creator */}

            <View
              className="items-center"
              style={{
                paddingTop: isCompact ? 9 : 12,
                paddingBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "PlusJakartaSans-Medium",
                  fontSize: 14,
                }}
              >
                Designed & developed by
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  color: COLORS.white,
                  fontFamily: "PlusJakartaSans-Bold",
                  fontSize: 14,
                }}
              >
                Kaif Qureshi
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

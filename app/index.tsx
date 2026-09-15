import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND_COLOR = "#EE7854";

export default function WelcomeScreen() {
  const router = useRouter();

  const { width, height } = useWindowDimensions();

  // -----------------------------------------
  // RESPONSIVE VALUES
  // -----------------------------------------

  const isSmallScreen = height < 720;
  const isVerySmallScreen = height < 660;

  /*
   * Pattern takes approximately 65% of the screen,
   * but is adjusted for different phone sizes.
   */
  const patternHeight = isVerySmallScreen
    ? height * 0.6
    : isSmallScreen
      ? height * 0.62
      : height * 0.65;

  /*
   * Responsive title.
   */
  const titleFontSize =
    width < 350 ? 30 : width < 390 ? 34 : width < 430 ? 38 : 42;

  const titleLineHeight = titleFontSize * 1.2;

  /*
   * Responsive subtitle.
   */
  const subtitleFontSize = width < 360 ? 16 : width < 430 ? 18 : 19;

  /*
   * Responsive horizontal padding.
   */
  const horizontalPadding = width < 350 ? 16 : width < 400 ? 20 : 24;

  /*
   * Responsive button.
   */
  const buttonHeight = isVerySmallScreen ? 54 : isSmallScreen ? 57 : 60;

  // -----------------------------------------
  // ANIMATION VALUES
  // -----------------------------------------

  const patternOpacity = useRef(new Animated.Value(0)).current;

  const patternScale = useRef(new Animated.Value(1.06)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;

  const contentTranslateY = useRef(new Animated.Value(25)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  // -----------------------------------------
  // ENTRANCE ANIMATION
  // -----------------------------------------

  useEffect(() => {
    Animated.parallel([
      /*
       * Pattern
       */
      Animated.timing(patternOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(patternScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      /*
       * Heading + subtitle
       */
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 650,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 650,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      /*
       * Button
       */
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    patternOpacity,
    patternScale,
    contentOpacity,
    contentTranslateY,
    buttonOpacity,
    buttonTranslateY,
  ]);

  const handleGetStarted = () => {
    router.push("/(auth)/sign-in");
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: BACKGROUND_COLOR,
      }}
    >
      <StatusBar style="light" />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1">
          <Animated.View
            style={{
              width: "100%",
              height: patternHeight,

              opacity: patternOpacity,

              transform: [
                {
                  scale: patternScale,
                },
              ],
            }}
          >
            <Image
              source={require("../assets/images/splash-pattern.png")}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Animated.View>

          <View
            className="flex-1 items-center"
            style={{
              paddingHorizontal: horizontalPadding,
            }}
          >
            <Animated.View
              className="items-center w-full"
              style={{
                opacity: contentOpacity,

                transform: [
                  {
                    translateY: contentTranslateY,
                  },
                ],

                marginTop: isVerySmallScreen ? 6 : isSmallScreen ? 10 : 12,
              }}
            >
              <Text
                className="text-center font-sans-bold text-white"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  width: "100%",
                  fontSize: titleFontSize,
                  lineHeight: titleLineHeight,
                  letterSpacing: -1.2,
                }}
              >
                Gain Financial Clarity
              </Text>

              <Text
                className="mt-2 text-center font-sans-medium text-white"
                style={{
                  fontSize: subtitleFontSize,
                  lineHeight: subtitleFontSize * 1.45,
                  letterSpacing: -0.1,
                }}
              >
                Track, analyze and cancel with ease
              </Text>
            </Animated.View>

            <Animated.View
              className="w-full"
              style={{
                opacity: buttonOpacity,

                transform: [
                  {
                    translateY: buttonTranslateY,
                  },
                ],

                marginTop: isVerySmallScreen ? 14 : isSmallScreen ? 18 : 20,
              }}
            >
              <Pressable
                onPress={handleGetStarted}
                accessibilityRole="button"
                accessibilityLabel="Get Started"
                android_ripple={{
                  color: "#E5E7EB",
                }}
                style={({ pressed }) => ({
                  width: "100%",
                  height: buttonHeight,

                  alignItems: "center",
                  justifyContent: "center",

                  borderRadius: 999,

                  backgroundColor: "#FFFFFF",

                  /*
                   * Smooth press feedback
                   */
                  transform: [
                    {
                      scale: pressed ? 0.975 : 1,
                    },
                  ],

                  /*
                   * Android shadow
                   */
                  elevation: pressed ? 2 : 6,

                  /*
                   * iOS shadow
                   */
                  shadowColor: "#000000",
                  shadowOffset: {
                    width: 0,
                    height: pressed ? 2 : 5,
                  },
                  shadowOpacity: pressed ? 0.08 : 0.14,
                  shadowRadius: pressed ? 5 : 10,
                })}
                className="mt-1 w-full items-center justify-center rounded-full bg-white py-3"
              >
                <Text
                  className="font-sans-bold text-[#111827]"
                  style={{
                    fontSize: width < 360 ? 16 : 17,
                    letterSpacing: -0.2,
                  }}
                >
                  Get Started
                </Text>
              </Pressable>
            </Animated.View>

            <View className="flex-1" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

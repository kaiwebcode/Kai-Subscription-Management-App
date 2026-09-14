import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function SubscriptionDetails () {

    const { Id } = useLocalSearchParams<{Id: string}>();

    return (
        <View>
            <Text>
                Subscription Details: {Id}
            </Text>
            <Link href="/">Go Back</Link>
        </View>
    )
}
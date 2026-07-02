import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass } from 'lucide-react-native';
import { Button } from '@/components/ui';
import { GoogleButton } from '@/components/google-button';

// Build-time constant — determines whether Google sign-in is available.
const GOOGLE_CONFIGURED = !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function Welcome() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <View className="flex-1 justify-between px-6 py-10">
        <View />

        <View className="items-center gap-5">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Compass color="#FFFFFF" size={30} strokeWidth={2} />
          </View>
          <Text className="text-center text-[32px] font-bold leading-9 tracking-tight text-foreground">
            Find your people,{'\n'}near you
          </Text>
          <Text className="max-w-[280px] text-center text-[16px] leading-6 text-muted">
            Discover and join real-world activities happening around you.
          </Text>
        </View>

        <View className="gap-3">
          <Button label="Explore activities" onPress={() => router.push('/discover')} />
          {GOOGLE_CONFIGURED ? (
            <GoogleButton onSuccess={() => router.replace('/discover')} />
          ) : (
            <Button label="Google sign-in not configured" variant="outline" disabled />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

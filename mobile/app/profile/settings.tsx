import * as React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { SubHeader, Button, Card } from '@/components/ui';
import { roame } from '@/lib/api';
import { useLocation } from '@/lib/location';

const RADII = [5, 10, 25, 50];
const MESSAGE_OPTIONS = ['everyone', 'following', 'none'] as const;

export default function SettingsScreen() {
  const [push, setPush] = React.useState(true);
  const [emails, setEmails] = React.useState(true);
  const [radius, setRadius] = React.useState(10);
  const [messagesFrom, setMessagesFrom] = React.useState<string>('everyone');
  const [pending, setPending] = React.useState(false);
  const { location, status } = useLocation();

  React.useEffect(() => {
    roame
      .myProfile()
      .then((me) => {
        if (!me.settings) return;
        setPush(me.settings.pushEnabled);
        setEmails(me.settings.emailEnabled);
        setRadius(me.settings.discoveryRadiusKm);
        setMessagesFrom(me.settings.allowMessagesFrom);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setPending(true);
    try {
      await roame.updateSettings({
        pushEnabled: push,
        emailEnabled: emails,
        discoveryRadiusKm: radius,
        allowMessagesFrom: messagesFrom,
      });
      Alert.alert('Saved', 'Settings updated.');
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPending(false);
    }
  }

  async function syncLocation() {
    if (status !== 'ready' || !location) {
      Alert.alert('Location unavailable', 'Enable location permission first.');
      return;
    }
    try {
      await roame.updateLocation(location.lat, location.lng, location.name ?? undefined);
      Alert.alert('Location updated', location.name ?? 'Saved your home location.');
    } catch (e) {
      Alert.alert('Could not update', e instanceof Error ? e.message : '');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Card className="gap-4">
          <ToggleRow label="Push notifications" value={push} onChange={setPush} />
          <View className="h-px bg-border" />
          <ToggleRow label="Email updates" value={emails} onChange={setEmails} />
        </Card>

        <Card className="gap-3">
          <Text className="text-[15px] font-semibold text-foreground">Discovery radius</Text>
          <View className="flex-row gap-2">
            {RADII.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                className={`flex-1 items-center rounded-xl border py-2.5 ${radius === r ? 'border-foreground bg-foreground' : 'border-border bg-surface'}`}
              >
                <Text className={`text-[13px] font-medium ${radius === r ? 'text-background' : 'text-muted'}`}>{r} km</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="gap-3">
          <Text className="text-[15px] font-semibold text-foreground">Allow messages from</Text>
          <View className="flex-row gap-2">
            {MESSAGE_OPTIONS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMessagesFrom(m)}
                className={`flex-1 items-center rounded-xl border py-2.5 ${messagesFrom === m ? 'border-foreground bg-foreground' : 'border-border bg-surface'}`}
              >
                <Text className={`text-[13px] font-medium capitalize ${messagesFrom === m ? 'text-background' : 'text-muted'}`}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Pressable
          onPress={syncLocation}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-border py-4 active:opacity-80"
        >
          <MapPin color="#059669" size={18} />
          <Text className="text-[15px] font-semibold text-foreground">
            Set home location{location?.name ? ` (${location.name})` : ''}
          </Text>
        </Pressable>

        <Button label="Save settings" loading={pending} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[15px] font-medium text-foreground">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#059669' }} />
    </View>
  );
}

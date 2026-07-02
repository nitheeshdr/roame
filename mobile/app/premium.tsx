import * as React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Check } from 'lucide-react-native';
import { SubHeader, Button, Card } from '@/components/ui';
import { roame, type Plan } from '@/lib/api';
import { useSession } from '@/lib/session';

function price(cents: number, interval: string): string {
  if (cents === 0) return 'Free';
  return `₹${(cents / 100).toFixed(0)} / ${interval === 'YEARLY' ? 'year' : 'month'}`;
}

export default function Premium() {
  const { user } = useSession();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [current, setCurrent] = React.useState<{ status: string; plan: Plan } | null>(null);
  const [selected, setSelected] = React.useState<string>('');
  const [pending, setPending] = React.useState(false);

  const load = React.useCallback(() => {
    roame.plans().then((r) => setPlans(r.data)).catch(() => {});
    if (user) roame.currentSubscription().then((r) => setCurrent(r.subscription)).catch(() => {});
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function subscribe() {
    if (!user) return router.push('/sign-in');
    if (!selected) return;
    setPending(true);
    try {
      await roame.subscribe(selected);
      Alert.alert('Welcome to Premium', 'Your plan is active.');
      load();
    } catch (e) {
      Alert.alert('Could not subscribe', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  async function cancel() {
    setPending(true);
    try {
      await roame.cancelSubscription();
      Alert.alert('Cancelled', 'Your subscription has been cancelled.');
      setCurrent(null);
      load();
    } catch (e) {
      Alert.alert('Could not cancel', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Roame Premium" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View className="items-center gap-2 py-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Crown color="#FFFFFF" size={26} strokeWidth={2} />
          </View>
          <Text className="text-[22px] font-bold text-foreground">Go Premium</Text>
          <Text className="text-center text-[14px] text-muted">Priority discovery, advanced filters, and more.</Text>
        </View>

        {current ? (
          <Card className="gap-3 border-primary/40">
            <View className="flex-row items-center gap-2">
              <Check color="#059669" size={18} strokeWidth={2.5} />
              <Text className="text-[16px] font-semibold text-foreground">
                {current.plan.name} · {current.status}
              </Text>
            </View>
            <Button label="Cancel subscription" variant="outline" loading={pending} onPress={cancel} />
          </Card>
        ) : (
          <>
            {plans.map((p) => {
              const active = selected === p.slug;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelected(p.slug)}
                  className={`rounded-2xl border p-4 ${active ? 'border-primary bg-surface' : 'border-border bg-surface'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[16px] font-semibold text-foreground">{p.name}</Text>
                    <Text className={`text-[15px] font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
                      {price(p.priceCents, p.interval)}
                    </Text>
                  </View>
                  {p.description ? <Text className="mt-1 text-[13px] text-muted">{p.description}</Text> : null}
                </Pressable>
              );
            })}
            <Button label="Continue" loading={pending} disabled={!selected} onPress={subscribe} className="mt-2" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

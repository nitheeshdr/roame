import * as React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubHeader, Button } from '@/components/ui';
import { roame, type Interest } from '@/lib/api';

export default function Interests() {
  const [catalog, setCatalog] = React.useState<Interest[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    Promise.all([roame.interestsCatalog(), roame.myProfile()])
      .then(([cat, me]) => {
        setCatalog(cat.data);
        setSelected(new Set(me.interests.map((i) => i.interest.slug)));
      })
      .catch(() => {});
  }, []);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function save() {
    setPending(true);
    try {
      await roame.updateInterests([...selected]);
      Alert.alert('Saved', 'Your interests have been updated.');
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Interests" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="mb-4 text-[14px] text-muted">Pick what you love — we use it to recommend activities.</Text>
        <View className="flex-row flex-wrap gap-2">
          {catalog.map((i) => {
            const on = selected.has(i.slug);
            return (
              <Pressable
                key={i.id}
                onPress={() => toggle(i.slug)}
                className={`rounded-full border px-4 py-2.5 ${on ? 'border-primary bg-primary' : 'border-border bg-surface'}`}
              >
                <Text className={`text-[14px] font-medium ${on ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {i.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button label={`Save (${selected.size})`} loading={pending} onPress={save} className="mt-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

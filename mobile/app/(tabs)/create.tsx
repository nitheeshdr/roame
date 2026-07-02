import * as React from 'react';
import { Alert, ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen, ScreenHeader, Field, Button, EmptyState } from '@/components/ui';
import { useSession } from '@/lib/session';
import { roame } from '@/lib/api';

const WHEN_OPTIONS = [
  { label: 'Tomorrow 6:30 PM', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
];

function startsAtFrom(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 30, 0, 0);
  return d.toISOString();
}

export default function Create() {
  const { user } = useSession();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [city, setCity] = React.useState('');
  const [capacity, setCapacity] = React.useState('');
  const [whenIdx, setWhenIdx] = React.useState(1);
  const [pending, setPending] = React.useState(false);

  if (!user) {
    return (
      <Screen>
        <ScreenHeader title="Host an activity" />
        <EmptyState title="Sign in to host" subtitle="Create activities and manage RSVPs." />
        <View className="px-5">
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </View>
      </Screen>
    );
  }

  async function submit() {
    if (title.trim().length < 3 || description.trim().length < 1) {
      Alert.alert('Add a title and description first.');
      return;
    }
    setPending(true);
    try {
      const { id } = await roame.createActivity({
        title: title.trim(),
        description: description.trim(),
        city: city.trim() || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        startsAt: startsAtFrom(WHEN_OPTIONS[whenIdx].days),
        visibility: 'PUBLIC',
      });
      router.replace(`/activity/${id}`);
    } catch (e) {
      Alert.alert('Could not create', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Host an activity" subtitle="Bring people together." />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="Sunset 5K run" />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What are you doing, and who's it for?"
          multiline
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
        />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Bengaluru" />
        <Field label="Capacity (optional)" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="20" />

        <View className="gap-2">
          <Text className="text-[13px] font-medium text-foreground">When</Text>
          <View className="flex-row gap-2">
            {WHEN_OPTIONS.map((o, i) => (
              <Pressable
                key={o.label}
                onPress={() => setWhenIdx(i)}
                className={`flex-1 items-center rounded-xl border px-2 py-3 ${i === whenIdx ? 'border-foreground bg-foreground' : 'border-border bg-surface'}`}
              >
                <Text className={`text-center text-[12px] font-medium ${i === whenIdx ? 'text-background' : 'text-muted'}`}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button label="Publish activity" loading={pending} onPress={submit} className="mt-2" />
      </ScrollView>
    </Screen>
  );
}

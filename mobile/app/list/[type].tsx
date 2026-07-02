import * as React from 'react';
import { FlatList, View, Pressable, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui';
import { ActivityListCard } from '@/components/activity-list-card';
import { roame, type ActivityCard } from '@/lib/api';

const TITLES: Record<string, string> = { hosted: 'My activities', joined: 'Joined', saved: 'Saved' };

export default function ListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const kind = (type ?? 'saved') as string;
  const [items, setItems] = React.useState<ActivityCard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res =
          kind === 'saved'
            ? await roame.saved()
            : await roame.mine(kind === 'hosted' ? 'hosted' : 'joined');
        setItems(res.data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [kind]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <View className="flex-row items-center gap-2 px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ChevronLeft color="#111111" size={24} />
        </Pressable>
        <Text className="text-[20px] font-bold text-foreground">{TITLES[kind] ?? 'Activities'}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ActivityListCard activity={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}
        ListEmptyComponent={loading ? null : <EmptyState title="Nothing here yet" />}
      />
    </SafeAreaView>
  );
}

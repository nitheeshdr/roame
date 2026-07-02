import * as React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Search, MapPin, TrendingUp, CalendarRange, ChevronRight } from 'lucide-react-native';
import { Screen, EmptyState } from '@/components/ui';
import { ActivityListCard } from '@/components/activity-list-card';
import { FeaturedCard, FEATURED_WIDTH } from '@/components/featured-card';
import { categoryIcon } from '@/components/category-icon';
import { roame, type ActivityCard } from '@/lib/api';
import { useLocation } from '@/lib/location';

interface Category {
  id: string;
  slug: string;
  name: string;
}

export default function Home() {
  const [upcoming, setUpcoming] = React.useState<ActivityCard[]>([]);
  const [trending, setTrending] = React.useState<ActivityCard[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [results, setResults] = React.useState<ActivityCard[]>([]);
  const [q, setQ] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const { location, status } = useLocation();

  const filtering = q.trim().length > 0 || !!categoryId;

  const place =
    status === 'ready' && location?.name
      ? location.name
      : status === 'denied'
        ? 'Enable location'
        : status === 'loading'
          ? 'Locating…'
          : 'Near you';

  const loadHome = React.useCallback(async () => {
    try {
      const [up, tr, cats] = await Promise.all([
        roame.listActivities({ pageSize: 10 }),
        roame.trending(),
        roame.categories(),
      ]);
      setUpcoming(up.data);
      setTrending(tr.data);
      setCategories(cats.data);
    } catch {
      /* keep last data */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadHome();
  }, [loadHome]);

  // Debounced filtered results when searching or a category chip is active.
  React.useEffect(() => {
    if (!filtering) return;
    const t = setTimeout(async () => {
      try {
        const res = await roame.listActivities({
          pageSize: 30,
          q: q.trim() || undefined,
          categoryId: categoryId || undefined,
        });
        setResults(res.data);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, categoryId, filtering]);

  const header = (
    <View>
      {/* Location + title */}
      <View className="px-5 pb-3 pt-1">
        <View className="flex-row items-center gap-1.5">
          <MapPin color="#059669" size={15} strokeWidth={2} />
          <Text className="text-[13px] font-medium text-muted">{place}</Text>
        </View>
        <Text className="mt-1 text-[28px] font-bold tracking-tight text-foreground">Discover</Text>
      </View>

      {/* Search */}
      <View className="mx-5 mb-4 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
        <Search color="#71717A" size={18} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search events"
          placeholderTextColor="#A1A1AA"
          className="h-11 flex-1 text-[15px] text-foreground"
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-1"
      >
        <Chip label="All" active={!categoryId} onPress={() => setCategoryId('')} />
        {categories.map((c) => {
          const Icon = categoryIcon(c.slug);
          const active = categoryId === c.id;
          return (
            <Chip
              key={c.id}
              label={c.name}
              active={active}
              icon={<Icon color={active ? '#FAFAFA' : '#71717A'} size={14} strokeWidth={1.75} />}
              onPress={() => setCategoryId(active ? '' : c.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  if (filtering) {
    return (
      <Screen>
        <FlatList
          data={results}
          keyExtractor={(a) => a.id}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <View className="px-5">
              <ActivityListCard activity={item} />
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="No matches" subtitle="Try a different search or category." />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHome} />}
      >
        {header}

        {/* Happening soon — slider cards */}
        <SectionTitle
          icon={<CalendarRange color="#059669" size={18} strokeWidth={2} />}
          title="Happening soon"
          onSeeAll={() => router.push('/(tabs)/map')}
        />
        {upcoming.length === 0 && !loading ? (
          <View className="px-5">
            <EmptyState title="No upcoming events" subtitle="Be the first — host one from the Host tab." />
          </View>
        ) : (
          <FlatList
            horizontal
            data={upcoming}
            keyExtractor={(a) => a.id}
            renderItem={({ item }) => <FeaturedCard activity={item} />}
            ItemSeparatorComponent={() => <View className="w-3" />}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}
            showsHorizontalScrollIndicator={false}
            snapToInterval={FEATURED_WIDTH + 12}
            decelerationRate="fast"
          />
        )}

        {/* Trending */}
        <SectionTitle
          icon={<TrendingUp color="#059669" size={18} strokeWidth={2} />}
          title="Trending now"
        />
        <View className="gap-3 px-5">
          {trending.slice(0, 6).map((a) => (
            <ActivityListCard key={a.id} activity={a} />
          ))}
          {trending.length === 0 && !loading ? (
            <Text className="py-6 text-center text-[14px] text-muted">Nothing trending yet.</Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({
  icon,
  title,
  onSeeAll,
}: {
  icon: React.ReactNode;
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between px-5">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-[18px] font-bold tracking-tight text-foreground">{title}</Text>
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} className="flex-row items-center gap-0.5">
          <Text className="text-[13px] font-medium text-primary">Map view</Text>
          <ChevronRight color="#059669" size={14} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
        active ? 'border-foreground bg-foreground' : 'border-border bg-surface'
      }`}
    >
      {icon}
      <Text className={`text-[13px] font-medium ${active ? 'text-background' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

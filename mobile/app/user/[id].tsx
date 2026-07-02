import * as React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Flag, Ban, MapPin, ShieldCheck } from 'lucide-react-native';
import { SubHeader, Avatar, Button, Card, Badge, EmptyState } from '@/components/ui';
import { ActivityListCard } from '@/components/activity-list-card';
import { roame, type PublicProfile, type ActivityCard, type Review } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [activities, setActivities] = React.useState<ActivityCard[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [avg, setAvg] = React.useState<number | null>(null);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [rating, setRating] = React.useState(0);

  const isMe = user?.id === id;

  React.useEffect(() => {
    (async () => {
      try {
        const [p, acts, revs] = await Promise.all([
          roame.publicProfile(id),
          roame.userActivities(id).catch(() => ({ data: [] as ActivityCard[] })),
          roame.userReviews(id).catch(() => ({ data: [] as Review[], averageRating: null })),
        ]);
        setProfile(p);
        setActivities(acts.data);
        setReviews(revs.data);
        setAvg('averageRating' in revs ? revs.averageRating : null);
        if (user) {
          const fg = await roame.following().catch(() => ({ data: [] as { id: string }[] }));
          setIsFollowing(fg.data.some((u) => u.id === id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  async function toggleFollow() {
    if (!user) return router.push('/sign-in');
    setPending(true);
    try {
      if (isFollowing) await roame.unfollow(id);
      else await roame.follow(id);
      setIsFollowing(!isFollowing);
    } catch (e) {
      Alert.alert('Action failed', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  async function submitReview(stars: number) {
    if (!user) return router.push('/sign-in');
    setRating(stars);
    try {
      await roame.createReview({ rating: stars, subjectId: id });
      Alert.alert('Thanks', 'Your review has been posted.');
    } catch (e) {
      Alert.alert('Could not review', e instanceof Error ? e.message : '');
      setRating(0);
    }
  }

  function reportUser() {
    if (!user) return router.push('/sign-in');
    Alert.alert('Report user', 'Report this user to the Roame team?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          await roame
            .report({ targetType: 'USER', targetId: id, reportedUserId: id, reason: 'Inappropriate behaviour' })
            .then(() => Alert.alert('Reported', 'Our team will take a look.'))
            .catch(() => {});
        },
      },
    ]);
  }

  function blockUser() {
    if (!user) return router.push('/sign-in');
    Alert.alert('Block user', "They won't be able to follow or message you.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          await roame.block(id).then(() => Alert.alert('Blocked')).catch(() => {});
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#059669" />
      </View>
    );
  }
  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
        <SubHeader title="Profile" onBack={() => router.back()} />
        <EmptyState title="User not found" />
      </SafeAreaView>
    );
  }

  const name = profile.profile?.displayName ?? 'Roamer';

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title={name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 18 }}>
        {/* Identity */}
        <View className="items-center gap-2">
          <Avatar name={name} size={80} />
          <Text className="text-[22px] font-bold text-foreground">{name}</Text>
          {profile.profile?.username ? <Text className="text-[14px] text-muted">@{profile.profile.username}</Text> : null}
          {profile.profile?.city ? (
            <View className="flex-row items-center gap-1">
              <MapPin color="#71717A" size={13} />
              <Text className="text-[13px] text-muted">{profile.profile.city}</Text>
            </View>
          ) : null}
          {profile.trustScore ? (
            <View className="flex-row items-center gap-1">
              <ShieldCheck color="#059669" size={13} strokeWidth={2} />
              <Text className="text-[13px] font-medium text-primary">
                Trust {profile.trustScore.score}
                {avg != null ? ` · ${avg.toFixed(1)} rating` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Stats + follow */}
        <View className="flex-row items-center justify-center gap-6">
          <Text className="text-[14px] text-muted">
            <Text className="font-bold text-foreground">{profile.followers}</Text> followers
          </Text>
          <Text className="text-[14px] text-muted">
            <Text className="font-bold text-foreground">{profile.following}</Text> following
          </Text>
        </View>
        {!isMe ? (
          <Button
            label={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'outline' : 'primary'}
            loading={pending}
            onPress={toggleFollow}
          />
        ) : null}

        {profile.profile?.bio ? <Text className="text-center text-[15px] leading-6 text-muted">{profile.profile.bio}</Text> : null}

        {profile.interests.length > 0 ? (
          <View className="flex-row flex-wrap justify-center gap-2">
            {profile.interests.map((i) => (
              <Badge key={i.interest.slug} label={i.interest.name} />
            ))}
          </View>
        ) : null}

        {/* Rate this host */}
        {!isMe ? (
          <Card className="items-center gap-2">
            <Text className="text-[15px] font-semibold text-foreground">Rate this host</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => submitReview(s)}>
                  <Star
                    size={28}
                    color={s <= rating ? '#059669' : '#D4D4D8'}
                    fill={s <= rating ? '#059669' : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Activities */}
        {activities.length > 0 ? (
          <View className="gap-3">
            <Text className="text-[17px] font-bold text-foreground">Activities by {name}</Text>
            {activities.slice(0, 5).map((a) => (
              <ActivityListCard key={a.id} activity={a} />
            ))}
          </View>
        ) : null}

        {/* Reviews */}
        {reviews.length > 0 ? (
          <View className="gap-3">
            <Text className="text-[17px] font-bold text-foreground">Reviews</Text>
            {reviews.slice(0, 5).map((r) => (
              <Card key={r.id} className="gap-1">
                <View className="flex-row items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} color={s <= r.rating ? '#059669' : '#D4D4D8'} fill={s <= r.rating ? '#059669' : 'transparent'} />
                  ))}
                  <Text className="ml-1 text-[12px] text-muted">{r.author?.profile?.displayName ?? 'Roamer'}</Text>
                </View>
                {r.comment ? <Text className="text-[14px] text-foreground">{r.comment}</Text> : null}
              </Card>
            ))}
          </View>
        ) : null}

        {/* Safety */}
        {!isMe ? (
          <View className="flex-row gap-3">
            <Pressable onPress={reportUser} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3.5">
              <Flag color="#71717A" size={16} />
              <Text className="text-[14px] font-medium text-muted">Report</Text>
            </Pressable>
            <Pressable onPress={blockUser} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3.5">
              <Ban color="#DC2626" size={16} />
              <Text className="text-[14px] font-medium text-destructive">Block</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

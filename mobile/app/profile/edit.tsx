import * as React from 'react';
import { Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubHeader, Field, Button } from '@/components/ui';
import { roame } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function EditProfile() {
  const { refresh } = useSession();
  const [displayName, setDisplayName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [city, setCity] = React.useState('');
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    roame
      .myProfile()
      .then((me) => {
        setDisplayName(me.profile?.displayName ?? '');
        setUsername(me.profile?.username ?? '');
        setBio(me.profile?.bio ?? '');
        setCity(me.profile?.city ?? '');
      })
      .catch(() => {});
  }, []);

  async function save() {
    setPending(true);
    try {
      await roame.updateProfile({
        displayName: displayName.trim(),
        ...(username.trim() ? { username: username.trim().toLowerCase() } : {}),
        bio: bio.trim(),
        city: city.trim(),
      });
      await refresh();
      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Edit profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Field label="Username" value={username} onChangeText={setUsername} placeholder="lowercase_and_numbers" autoCapitalize="none" />
        <Field
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="A line about you"
          multiline
          style={{ height: 90, textAlignVertical: 'top', paddingTop: 10 }}
        />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Bengaluru" />
        <Button label="Save changes" loading={pending} disabled={displayName.trim().length < 1} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

import * as React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Compass } from 'lucide-react-native';
import { Field, Button } from '@/components/ui';
import { GoogleButton } from '@/components/google-button';
import { useSession } from '@/lib/session';

const GOOGLE_CONFIGURED = !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function SignIn() {
  const { signInEmail, refresh } = useSession();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      await signInEmail(email.trim(), password);
      router.back();
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Check your details.');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top', 'bottom']}>
      <View className="flex-row justify-end px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <X color="#111111" size={22} />
        </Pressable>
      </View>

      <View className="flex-1 px-6">
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Compass color="#FFFFFF" size={26} strokeWidth={2} />
          </View>
          <Text className="mt-4 text-[24px] font-bold tracking-tight text-foreground">Sign in to Roame</Text>
          <Text className="mt-1 text-center text-[14px] text-muted">Host, RSVP, and message your groups.</Text>
        </View>

        <View className="mt-8 gap-4">
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          <Button
            label="Continue"
            loading={pending}
            disabled={email.trim().length < 3 || password.length < 6}
            onPress={submit}
          />

          <View className="flex-row items-center justify-between px-1">
            <Pressable onPress={() => router.push('/sign-up')}>
              <Text className="text-[14px] font-medium text-primary">Create account</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/forgot-password')}>
              <Text className="text-[14px] text-muted">Forgot password?</Text>
            </Pressable>
          </View>

          {GOOGLE_CONFIGURED ? (
            <>
              <View className="flex-row items-center gap-3 py-2">
                <View className="h-px flex-1 bg-border" />
                <Text className="text-[12px] text-muted">or</Text>
                <View className="h-px flex-1 bg-border" />
              </View>
              <GoogleButton
                onSuccess={() => {
                  refresh();
                  router.back();
                }}
              />
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

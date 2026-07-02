import * as React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Compass } from 'lucide-react-native';
import { Field, Button } from '@/components/ui';
import { useSession } from '@/lib/session';

export default function SignUp() {
  const { signUp } = useSession();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.dismissAll();
    } catch (e) {
      Alert.alert('Could not sign up', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top', 'bottom']}>
      <View className="px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ChevronLeft color="#111111" size={24} />
        </Pressable>
      </View>

      <View className="flex-1 px-6">
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Compass color="#FFFFFF" size={26} strokeWidth={2} />
          </View>
          <Text className="mt-4 text-[24px] font-bold tracking-tight text-foreground">Create your account</Text>
          <Text className="mt-1 text-center text-[14px] text-muted">Join activities near you.</Text>
        </View>

        <View className="mt-8 gap-4">
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
          <Button
            label="Create account"
            loading={pending}
            disabled={name.trim().length < 1 || email.trim().length < 3 || password.length < 8}
            onPress={submit}
          />
        </View>

        <Pressable onPress={() => router.replace('/sign-in')} className="mt-6 items-center">
          <Text className="text-[14px] text-muted">
            Already have an account? <Text className="font-semibold text-primary">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

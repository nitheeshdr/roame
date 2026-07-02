import * as React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, KeyRound } from 'lucide-react-native';
import { Field, Button } from '@/components/ui';
import { roame } from '@/lib/api';

export default function ForgotPassword() {
  const [step, setStep] = React.useState<'email' | 'reset'>('email');
  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function request() {
    setPending(true);
    try {
      const res = await roame.forgotPassword(email.trim());
      // Without an email provider the API returns the token so the flow works.
      if (res.resetToken) setToken(res.resetToken);
      setStep('reset');
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  async function reset() {
    setPending(true);
    try {
      await roame.resetPassword(token.trim(), password);
      Alert.alert('Password updated', 'You can now sign in with your new password.');
      router.replace('/sign-in');
    } catch (e) {
      Alert.alert('Could not reset', e instanceof Error ? e.message : 'Check the code and try again.');
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
            <KeyRound color="#FFFFFF" size={24} strokeWidth={2} />
          </View>
          <Text className="mt-4 text-[24px] font-bold tracking-tight text-foreground">Reset password</Text>
          <Text className="mt-1 text-center text-[14px] text-muted">
            {step === 'email' ? "Enter your email and we'll send a reset code." : 'Enter the code and a new password.'}
          </Text>
        </View>

        {step === 'email' ? (
          <View className="mt-8 gap-4">
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button label="Send reset code" loading={pending} disabled={email.trim().length < 3} onPress={request} />
          </View>
        ) : (
          <View className="mt-8 gap-4">
            <Field label="Reset code" value={token} onChangeText={setToken} placeholder="Paste the reset code" autoCapitalize="none" />
            <Field label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
            <Button label="Update password" loading={pending} disabled={!token || password.length < 8} onPress={reset} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

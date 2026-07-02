import * as React from 'react';
import { Text, View } from 'react-native';
import { Button } from './ui';
import { useGoogleSignIn } from '@/lib/auth';

/**
 * Renders the real Google sign-in button. This component is only mounted when a
 * Google client id is configured (see index.tsx) — the underlying auth hook
 * throws if no platform client id exists, so it must not run otherwise.
 */
export function GoogleButton({ onSuccess }: { onSuccess: () => void }) {
  const google = useGoogleSignIn(onSuccess);
  return (
    <View className="gap-2">
      <Button
        label="Continue with Google"
        variant="outline"
        loading={google.loading}
        onPress={() => google.signIn()}
      />
      {google.error ? (
        <Text className="text-center text-[13px] text-destructive">{google.error}</Text>
      ) : null}
    </View>
  );
}

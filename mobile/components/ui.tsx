import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

/** Self-contained premium components (NativeWind v4). No emoji, no gradients. */

export function Screen({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <View className={`flex-1 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-2xl border border-border bg-surface p-4 ${className}`}>{children}</View>;
}

export function Badge({ label, className = '' }: { label: string; className?: string }) {
  return (
    <View className={`self-start rounded-full bg-subtle px-3 py-1 ${className}`}>
      <Text className="text-[12px] font-medium text-foreground">{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const initials = (name ?? '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
  return (
    <View
      className="items-center justify-center rounded-full bg-subtle"
      style={{ width: size, height: size }}
    >
      <Text className="font-semibold text-foreground" style={{ fontSize: size * 0.4 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'ghost';
export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  className = '',
}: {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress?: PressableProps['onPress'];
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-primary'
      : variant === 'outline'
        ? 'border border-border bg-surface'
        : '';
  const textStyles = variant === 'primary' ? 'text-primary-foreground' : 'text-foreground';
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      className={`h-14 flex-row items-center justify-center rounded-2xl px-6 active:opacity-90 ${styles} ${off ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#111111'} />
      ) : (
        <Text className={`text-[16px] font-semibold ${textStyles}`}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] font-medium text-foreground">{label}</Text>
      <TextInput
        placeholderTextColor="#A1A1AA"
        className="h-12 rounded-xl border border-border bg-surface px-3 text-[16px] text-foreground"
        {...props}
      />
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-center text-[17px] font-semibold text-foreground">{title}</Text>
      {subtitle ? <Text className="mt-1 text-center text-[14px] text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="px-5 pb-3 pt-1">
      <Text className="text-[28px] font-bold tracking-tight text-foreground">{title}</Text>
      {subtitle ? <Text className="mt-1 text-[15px] text-muted">{subtitle}</Text> : null}
    </View>
  );
}

/** Back header for pushed sub-screens. */
export function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-1 px-3 py-2">
      <Pressable onPress={onBack} className="h-10 w-10 items-center justify-center">
        <ChevronLeft color="#111111" size={24} strokeWidth={2} />
      </Pressable>
      <Text className="text-[20px] font-bold tracking-tight text-foreground">{title}</Text>
    </View>
  );
}

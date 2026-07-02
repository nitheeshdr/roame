import * as React from 'react';
import { Pressable, Text, View, ActivityIndicator, type PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

/**
 * Small self-contained premium component set (NativeWind v4). Neutral surfaces,
 * emerald primary, blue accent. No emoji, no gradients.
 */

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl border border-border bg-surface p-4 ${className}`}>{children}</View>
  );
}

export function Badge({ label, className = '' }: { label: string; className?: string }) {
  return (
    <View className={`self-start rounded-full bg-subtle px-3 py-1 ${className}`}>
      <Text className="text-[12px] font-medium text-foreground">{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'outline';
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
  const base =
    'h-14 flex-row items-center justify-center rounded-2xl px-6 active:opacity-90';
  const styles =
    variant === 'primary'
      ? 'bg-primary'
      : 'border border-border bg-surface';
  const textStyles = variant === 'primary' ? 'text-primary-foreground' : 'text-foreground';
  const isOff = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isOff}
      className={`${base} ${styles} ${isOff ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#111111'} />
      ) : (
        <Text className={`text-[16px] font-semibold ${textStyles}`}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Allow className on lucide-react-native icons. */
export function enableIconClassName(Icon: React.ComponentType<Record<string, unknown>>) {
  cssInterop(Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
  return Icon;
}

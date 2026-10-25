import { Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function LabButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        padding: 12,
        borderRadius: 12,
        justifyContent: 'center',
        backgroundColor: theme.backgroundSelected,
        opacity: disabled || pressed ? 0.5 : 1,
      })}
    >
      <ThemedText style={{ fontWeight: '600', textAlign: 'center' }}>{label}</ThemedText>
    </Pressable>
  );
}

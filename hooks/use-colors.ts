import { useTheme } from '@/hooks/use-theme';

export function useColors() {
  const { colors } = useTheme();
  return colors;
}
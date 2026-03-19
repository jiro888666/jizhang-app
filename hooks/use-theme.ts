import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors as themeColors } from '@/theme.config';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = useMemo(() => ({
    // Base colors
    background: isDark ? themeColors.dark.background : themeColors.light.background,
    surface: isDark ? themeColors.dark.surface : themeColors.light.surface,
    text: isDark ? themeColors.dark.text : themeColors.light.text,
    textSecondary: isDark ? themeColors.dark.textSecondary : themeColors.light.textSecondary,

    // Brand colors
    primary: isDark ? themeColors.dark.primary : themeColors.light.primary,
    primaryLight: isDark ? themeColors.dark.primaryLight : themeColors.light.primaryLight,

    // Semantic colors
    income: isDark ? themeColors.dark.income : themeColors.light.income,
    incomeLight: isDark ? themeColors.dark.incomeLight : themeColors.light.incomeLight,
    expense: isDark ? themeColors.dark.expense : themeColors.light.expense,
    expenseLight: isDark ? themeColors.dark.expenseLight : themeColors.light.expenseLight,

    // UI colors
    border: isDark ? themeColors.dark.border : themeColors.light.border,
    muted: isDark ? themeColors.dark.muted : themeColors.light.muted,
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',

    // Tab bar
    tabBarBackground: isDark ? themeColors.dark.surface : themeColors.light.background,
    tabBarBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  }), [isDark]);

  return { colors, isDark };
}
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenContainer({ children, style, noPadding = false }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingHorizontal: noPadding ? 0 : 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
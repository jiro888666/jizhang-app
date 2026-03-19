import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SymbolView, SymbolViewProps, SFSymbol } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

// Map our custom icon names to SFSymbols (iOS) and Ionicons (fallback)
const iconMap: Record<string, { sfSymbol: SFSymbol; ionicon: keyof typeof Ionicons.glyphMap }> = {
  // Tab bar icons
  'house': { sfSymbol: 'house.fill', ionicon: 'home' },
  'list-bullet': { sfSymbol: 'list.bullet', ionicon: 'list' },
  'chart-pie': { sfSymbol: 'chart.pie.fill', ionicon: 'pie-chart' },
  'gearshape': { sfSymbol: 'gearshape.fill', ionicon: 'settings' },

  // Transaction icons
  'restaurant': { sfSymbol: 'fork.knife', ionicon: 'restaurant' },
  'directions-car': { sfSymbol: 'car.fill', ionicon: 'car' },
  'shopping-bag': { sfSymbol: 'bag.fill', ionicon: 'bag' },
  'home': { sfSymbol: 'house.fill', ionicon: 'home' },
  'sports-esports': { sfSymbol: 'gamecontroller.fill', ionicon: 'game-controller' },
  'school': { sfSymbol: 'graduationcap.fill', ionicon: 'school' },
  'local-hospital': { sfSymbol: 'cross.case.fill', ionicon: 'medkit' },
  'more-horiz': { sfSymbol: 'ellipsis.circle.fill', ionicon: 'ellipsis-horizontal' },
  'account-balance-wallet': { sfSymbol: 'wallet.fill', ionicon: 'wallet' },
  'card-giftcard': { sfSymbol: 'gift.fill', ionicon: 'gift' },
  'trending-up': { sfSymbol: 'chart.line.uptrend.xyaxis', ionicon: 'trending-up' },

  // UI icons
  'plus': { sfSymbol: 'plus', ionicon: 'add' },
  'plus.circle': { sfSymbol: 'plus.circle.fill', ionicon: 'add-circle' },
  'xmark': { sfSymbol: 'xmark', ionicon: 'close' },
  'chevron-left': { sfSymbol: 'chevron.left', ionicon: 'chevron-back' },
  'chevron-right': { sfSymbol: 'chevron.right', ionicon: 'chevron-forward' },
  'magnifyingglass': { sfSymbol: 'magnifyingglass', ionicon: 'search' },
  'calendar': { sfSymbol: 'calendar', ionicon: 'calendar' },
  'trash': { sfSymbol: 'trash', ionicon: 'trash' },
  'pencil': { sfSymbol: 'pencil', ionicon: 'pencil' },
  'arrow-down': { sfSymbol: 'arrow.down', ionicon: 'arrow-down' },
  'arrow-up': { sfSymbol: 'arrow.up', ionicon: 'arrow-up' },
  'arrow-clockwise': { sfSymbol: 'arrow.clockwise', ionicon: 'refresh' },
  'square.and.arrow.up': { sfSymbol: 'square.and.arrow.up', ionicon: 'share' },
  'square.and.arrow.down': { sfSymbol: 'square.and.arrow.down', ionicon: 'download' },
  'checkmark': { sfSymbol: 'checkmark', ionicon: 'checkmark' },
  'checkmark.circle': { sfSymbol: 'checkmark.circle.fill', ionicon: 'checkmark-circle' },
};

interface IconSymbolProps {
  name: string;
  size?: number;
  color: string;
  weight?: SymbolViewProps['weight'];
}

export function IconSymbol({ name, size = 24, color, weight = 'regular' }: IconSymbolProps) {
  const icon = iconMap[name];

  if (!icon) {
    // Fallback to Ionicons if icon not found
    return <Ionicons name="help-circle" size={size} color={color} />;
  }

  return (
    <SymbolView
      name={icon.sfSymbol}
      size={size}
      tintColor={color}
      weight={weight}
      fallback={
        <Ionicons name={icon.ionicon} size={size} color={color} />
      }
    />
  );
}

// Icon Button component
interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor,
}: IconButtonProps) {
  return (
    <View
      style={[
        styles.iconButton,
        backgroundColor && { backgroundColor },
      ]}
      onTouchEnd={onPress}
    >
      <IconSymbol name={icon} size={size} color={color || '#6366F1'} />
    </View>
  );
}

// FAB component
interface FABProps {
  onPress: () => void;
  icon?: string;
}

export function FAB({ onPress, icon = 'plus' }: FABProps) {
  return (
    <View style={styles.fabContainer} onTouchEnd={onPress}>
      <View style={styles.fab}>
        <IconSymbol name={icon} size={28} color="#FFFFFF" weight="medium" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
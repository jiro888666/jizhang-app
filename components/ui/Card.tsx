import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'gradient';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface BalanceCardProps {
  income: number;
  expense: number;
  balance: number;
  currency?: string;
}

export function BalanceCard({ income, expense, balance, currency = 'CNY' }: BalanceCardProps) {
  const colors = useColors();
  const symbols: Record<string, string> = { CNY: '¥', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || '¥';

  return (
    <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
      <Text style={styles.balanceLabel}>本月结余</Text>
      <Text style={styles.balanceAmount}>
        {symbol}{balance.toFixed(2)}
      </Text>
      <View style={styles.balanceRow}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceItemLabel}>收入</Text>
          <Text style={[styles.balanceItemAmount, { color: colors.incomeLight }]}>
            {symbol}{income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceItemLabel}>支出</Text>
          <Text style={[styles.balanceItemAmount, { color: colors.expenseLight }]}>
            {symbol}{expense.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
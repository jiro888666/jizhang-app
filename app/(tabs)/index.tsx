import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { BalanceCard } from '@/components/ui/Card';
import { FAB } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, getCurrentMonth, calculateBalance } from '@/lib/utils';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const { transactions, categories, budgets, isLoading } = useApp();
  const colors = useColors();
  const router = useRouter();

  const currentMonth = getCurrentMonth();
  const { income, expense, balance } = calculateBalance(transactions, currentMonth);

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get current month budget
  const totalBudget = budgets.find(b => b.month === currentMonth && b.categoryId === 'total');
  const budgetPercentage = totalBudget ? Math.min((expense / totalBudget.amount) * 100, 100) : 0;

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add');
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: '其他', icon: 'more-horiz', color: '#64748B' };
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategoryInfo(item.categoryId);
    const isExpense = item.type === 'expense';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.transactionItem,
          { backgroundColor: pressed ? colors.surface : 'transparent' },
        ]}
        onPress={() => router.push(`/transaction/${item.id}`)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: isExpense ? colors.expenseLight : colors.incomeLight }]}>
          <IconSymbol name={category.icon} size={20} color={isExpense ? colors.expense : colors.income} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
          {item.note && <Text style={[styles.note, { color: colors.textSecondary }]}>{item.note}</Text>}
        </View>
        <Text style={[
          styles.amount,
          { color: isExpense ? colors.expense : colors.income }
        ]}>
          {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
        </Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>加载中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>记账本</Text>
      </View>

      <BalanceCard
        balance={balance}
        income={income}
        expense={expense}
      />

      {totalBudget && (
        <View style={[styles.budgetCard, { backgroundColor: colors.surface }]}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetTitle, { color: colors.text }]}>本月预算</Text>
            <Text style={[styles.budgetAmount, { color: colors.text }]}>
              {formatCurrency(expense)} / {formatCurrency(totalBudget.amount)}
            </Text>
          </View>
          <View style={[styles.progressBackground, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: budgetPercentage > 80 ? colors.expense : colors.primary,
                  width: `${budgetPercentage}%`,
                },
              ]}
            />
          </View>
          {budgetPercentage > 80 && (
            <Text style={[styles.budgetWarning, { color: colors.expense }]}>
              预算即将用尽！
            </Text>
          )}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>最近交易</Text>
        <Pressable onPress={() => router.push('/transactions')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>查看全部</Text>
        </Pressable>
      </View>

      <FlatList
        data={recentTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list-bullet" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无交易记录
            </Text>
            <Text style={[styles.emptyHint, { color: colors.muted }]}>
              点击下方按钮添加第一笔
            </Text>
          </View>
        }
      />

      <FAB onPress={handleAddPress} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetWarning: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 4,
  },
});
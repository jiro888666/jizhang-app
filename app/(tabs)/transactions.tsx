import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { ActionSheet } from '@/components/ui/Modal';
import { FAB } from '@/components/ui/icon-symbol';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, groupTransactionsByDate } from '@/lib/utils';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const { transactions, categories, deleteTransaction } = useApp();
  const colors = useColors();
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showActions, setShowActions] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(t => t.type === filter);
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return (
          category?.name.toLowerCase().includes(search) ||
          t.note?.toLowerCase().includes(search)
        );
      });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, searchText, categories]);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { name: '其他', icon: 'more-horiz', color: '#64748B' };
  };

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add');
  };

  const handleTransactionLongPress = async (transaction: Transaction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTransaction(transaction);
    setShowActions(true);
  };

  const handleDelete = async () => {
    if (selectedTransaction) {
      await deleteTransaction(selectedTransaction.id);
      setSelectedTransaction(null);
    }
  };

  const handleEdit = () => {
    if (selectedTransaction) {
      router.push(`/transaction/${selectedTransaction.id}`);
      setSelectedTransaction(null);
    }
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
        onLongPress={() => handleTransactionLongPress(item)}
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

  const renderDateGroup = ({ item: { date, transactions: groupTransactions } }: { item: { date: string; transactions: Transaction[] } }) => (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
        {formatDate(date, 'yyyy年MM月dd日 EEEE')}
      </Text>
      {groupTransactions.map((transaction, index) => (
        <View key={transaction.id}>
          {renderTransaction({ item: transaction })}
          {index < groupTransactions.length - 1 && (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
        </View>
      ))}
    </View>
  );

  const filters: FilterType[] = ['all', 'income', 'expense'];
  const filterLabels: Record<FilterType, string> = {
    all: '全部',
    income: '收入',
    expense: '支出',
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>交易明细</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索分类或备注..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === f ? colors.primary : 'transparent',
                borderColor: filter === f ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? '#FFFFFF' : colors.textSecondary },
            ]}>
              {filterLabels[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={groupedTransactions}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list-bullet" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchText ? '未找到匹配的交易' : '暂无交易记录'}
            </Text>
          </View>
        }
      />

      <FAB onPress={handleAddPress} />

      <ActionSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        title="操作"
        options={[
          { label: '编辑', onPress: handleEdit },
          { label: '删除', onPress: handleDelete, danger: true },
        ]}
      />
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  separator: {
    height: 0.5,
    marginLeft: 68,
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
});
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';
import { Category, Budget } from '@/types';

export default function BudgetScreen() {
  const { categories, budgets, addBudget, updateBudget, deleteBudget } = useApp();
  const colors = useColors();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'total'>('total');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = getCurrentMonth();
  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth);
  }, [budgets, currentMonth]);

  const expenseCategories = useMemo(() => {
    return categories.filter(c => c.type === 'expense');
  }, [categories]);

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBudget(null);
    setSelectedCategoryId('total');
    setAmount('');
    setShowModal(true);
  };

  const handleEditPress = async (budget: Budget) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingBudget(budget);
    setSelectedCategoryId(budget.categoryId);
    setAmount(budget.amount.toString());
    setShowModal(true);
  };

  const handleDeletePress = (budget: Budget) => {
    Alert.alert(
      '删除预算',
      '确定要删除这个预算吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteBudget(budget.id);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }

    // Check for existing budget with same category and month
    const existingBudget = budgets.find(
      b => b.categoryId === selectedCategoryId && b.month === currentMonth && b.id !== editingBudget?.id
    );

    if (existingBudget) {
      Alert.alert('提示', '该分类本月已有预算设置');
      return;
    }

    setIsSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, {
          categoryId: selectedCategoryId,
          amount: amountNum,
          month: currentMonth,
        });
      } else {
        await addBudget({
          categoryId: selectedCategoryId,
          amount: amountNum,
          month: currentMonth,
        });
      }
      setShowModal(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryInfo = (categoryId: string | 'total'): Category & { name: string } => {
    if (categoryId === 'total') {
      return {
        id: 'total',
        name: '总支出',
        icon: 'account-balance-wallet',
        color: colors.primary,
        type: 'expense',
        isCustom: false,
      };
    }
    return categories.find(c => c.id === categoryId) || {
      id: categoryId,
      name: '其他',
      icon: 'more-horiz',
      color: '#64748B',
      type: 'expense',
      isCustom: false,
    };
  };

  const renderBudget = ({ item }: { item: Budget }) => {
    const category = getCategoryInfo(item.categoryId);

    return (
      <View style={[styles.budgetItem, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: category.color + '30' }]}>
          <IconSymbol name={category.icon} size={24} color={category.color} />
        </View>
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetName, { color: colors.text }]}>{category.name}</Text>
          <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>
            预算: {formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleEditPress(item)}
          >
            <IconSymbol name="pencil" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDeletePress(item)}
          >
            <IconSymbol name="trash" size={20} color={colors.expense} />
          </Pressable>
        </View>
      </View>
    );
  };

  const categoryOptions: (Category & { id: string | 'total' })[] = [
    {
      id: 'total',
      name: '总支出',
      icon: 'account-balance-wallet',
      color: colors.primary,
      type: 'expense',
      isCustom: false,
    },
    ...expenseCategories,
  ];

  // Filter out categories that already have budgets
  const availableCategories = useMemo(() => {
    const existingCategoryIds = currentMonthBudgets.map(b => b.categoryId);
    return categoryOptions.filter(c => !existingCategoryIds.includes(c.id) || c.id === editingBudget?.categoryId);
  }, [categoryOptions, currentMonthBudgets, editingBudget]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>返回</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>预算设置</Text>
        <Pressable onPress={handleAddPress} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.monthHeader}>
        <Text style={[styles.monthText, { color: colors.textSecondary }]}>
          当前月份: {currentMonth}
        </Text>
      </View>

      <FlatList
        data={currentMonthBudgets}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="account-balance-wallet" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无预算设置
            </Text>
            <Text style={[styles.emptyHint, { color: colors.muted }]}>
              点击右上角 + 添加月度预算
            </Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editingBudget ? '编辑预算' : '添加预算'}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
            选择分类
          </Text>
          <View style={styles.categoryGrid}>
            {availableCategories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected
                        ? category.color + '20'
                        : colors.surface,
                      borderColor: isSelected ? category.color : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color + '30' },
                    ]}
                  >
                    <IconSymbol
                      name={category.icon}
                      size={20}
                      color={category.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: isSelected ? category.color : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="预算金额"
            placeholder="输入预算金额"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalButtons}>
            <Button
              title="取消"
              onPress={() => setShowModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title="保存"
              onPress={handleSave}
              loading={isSaving}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  addButton: {
    minWidth: 60,
    alignItems: 'flex-end',
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  monthHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  monthText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
    marginTop: 8,
  },
  modalContent: {
    paddingTop: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});
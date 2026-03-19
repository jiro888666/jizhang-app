import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/Button';
import { Input, AmountInput } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { formatDate } from '@/lib/utils';

type TransactionType = 'expense' | 'income';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, transactions, updateTransaction, deleteTransaction, isLoading } = useApp();
  const colors = useColors();
  const router = useRouter();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Find the transaction
  const transaction = useMemo(() => {
    return transactions.find(t => t.id === id);
  }, [transactions, id]);

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction && !initialized) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.categoryId);
      setDate(new Date(transaction.date));
      setNote(transaction.note || '');
      setInitialized(true);
    }
  }, [transaction, initialized]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  // Redirect if transaction not found
  useEffect(() => {
    if (!isLoading && !transaction && initialized === false) {
      Alert.alert('错误', '交易记录不存在', [
        { text: '确定', onPress: () => router.back() }
      ]);
    }
  }, [isLoading, transaction, initialized, router]);

  const handleTypeChange = async (newType: TransactionType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setType(newType);
    // Reset category if type changes and current category doesn't match
    const currentCategory = categories.find(c => c.id === categoryId);
    if (currentCategory && currentCategory.type !== newType) {
      setCategoryId(null);
    }
  };

  const handleCategorySelect = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryId(id);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!transaction) return;

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }

    if (!categoryId) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    setIsSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateTransaction(transaction.id, {
        type,
        amount: parseFloat(amount),
        categoryId,
        date: date.toISOString().split('T')[0],
        note: note.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!transaction) return;

    Alert.alert(
      '删除交易',
      '确定要删除这条交易记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              await deleteTransaction(transaction.id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !initialized) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>返回</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>编辑交易</Text>
        <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={isDeleting}>
          <IconSymbol name="trash" size={22} color={colors.expense} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Type Switcher */}
        <View style={styles.typeContainer}>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor: type === 'expense' ? colors.expense : colors.surface,
                borderColor: type === 'expense' ? colors.expense : colors.border,
              },
            ]}
            onPress={() => handleTypeChange('expense')}
          >
            <Text
              style={[
                styles.typeText,
                { color: type === 'expense' ? '#FFFFFF' : colors.text },
              ]}
            >
              支出
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor: type === 'income' ? colors.income : colors.surface,
                borderColor: type === 'income' ? colors.income : colors.border,
              },
            ]}
            onPress={() => handleTypeChange('income')}
          >
            <Text
              style={[
                styles.typeText,
                { color: type === 'income' ? '#FFFFFF' : colors.text },
              ]}
            >
              收入
            </Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            金额
          </Text>
          <AmountInput
            value={amount}
            onChangeValue={setAmount}
            type={type}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.categorySection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            分类
          </Text>
          <View style={styles.categoryGrid}>
            {filteredCategories.map((category) => {
              const isSelected = categoryId === category.id;
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
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color + '30' },
                    ]}
                  >
                    <IconSymbol
                      name={category.icon}
                      size={24}
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
        </View>

        {/* Date Picker */}
        <View style={styles.dateSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            日期
          </Text>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(date, 'yyyy年MM月dd日')}
            </Text>
            <IconSymbol name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Note Input */}
        <View style={styles.noteSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            备注
          </Text>
          <Input
            placeholder="添加备注（可选）"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            containerStyle={styles.noteInput}
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <Button
            title="保存修改"
            onPress={handleSave}
            loading={isSaving}
            size="large"
          />
        </View>

        {/* Delete Button */}
        <View style={styles.deleteSection}>
          <Button
            title="删除记录"
            onPress={handleDelete}
            variant="danger"
            loading={isDeleting}
            size="large"
          />
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
  deleteButton: {
    minWidth: 60,
    alignItems: 'flex-end',
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categorySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  noteSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  noteInput: {
    marginBottom: 0,
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  deleteSection: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
});
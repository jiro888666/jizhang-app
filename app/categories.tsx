import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
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
import { Category } from '@/types';

type CategoryType = 'expense' | 'income';

const ICON_OPTIONS = [
  'restaurant', 'directions-car', 'cart', 'film',
  'local-hospital', 'home', 'school', 'pets',
  'sports-soccer', 'more-horiz', 'account-balance-wallet',
  'trending-up', 'card-giftcard', 'attach-money',
];

const COLOR_OPTIONS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#EC4899',
  '#10B981', '#EF4444', '#F59E0B', '#06B6D4',
  '#84CC16', '#6366F1', '#14B8A6', '#F43F5E',
];

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const colors = useColors();
  const router = useRouter();

  const [type, setType] = useState<CategoryType>('expense');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  const handleTypeChange = async (newType: CategoryType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setType(newType);
  };

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingCategory(null);
    setName('');
    setSelectedIcon(ICON_OPTIONS[0]);
    setSelectedColor(COLOR_OPTIONS[0]);
    setShowModal(true);
  };

  const handleEditPress = async (category: Category) => {
    if (!category.isCustom) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setShowModal(true);
  };

  const handleDeletePress = (category: Category) => {
    if (!category.isCustom) return;

    Alert.alert(
      '删除分类',
      `确定要删除"${category.name}"吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteCategory(category.id);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }

    setIsSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        await addCategory({
          name: name.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type,
          isCustom: true,
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

  const renderCategory = ({ item }: { item: Category }) => {
    const isCustom = item.isCustom;

    return (
      <View style={[styles.categoryItem, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '30' }]}>
          <IconSymbol name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        {isCustom ? (
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
        ) : (
          <Text style={[styles.defaultLabel, { color: colors.muted }]}>默认</Text>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>返回</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>分类管理</Text>
        <Pressable onPress={handleAddPress} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

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

      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="list-bullet" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无分类
            </Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? '编辑分类' : '添加分类'}
      >
        <View style={styles.modalContent}>
          <Input
            label="名称"
            placeholder="输入分类名称"
            value={name}
            onChangeText={setName}
            maxLength={10}
          />

          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
            选择图标
          </Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((icon) => {
              const isSelected = selectedIcon === icon;
              return (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <IconSymbol
                    name={icon}
                    size={24}
                    color={isSelected ? colors.primary : colors.text}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
            选择颜色
          </Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: isSelected ? colors.text : 'transparent',
                      borderWidth: isSelected ? 3 : 0,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              );
            })}
          </View>

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
  typeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  categoryItem: {
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
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  defaultLabel: {
    fontSize: 13,
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
  modalContent: {
    paddingTop: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
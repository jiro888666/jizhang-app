import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency } from '@/lib/utils';

export default function SettingsScreen() {
  const { categories, budgets, transactions, settings, updateSettings } = useApp();
  const colors = useColors();
  const router = useRouter();

  const handleExportData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const exportData = {
      transactions,
      categories,
      budgets,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    try {
      await Share.share({
        message: jsonString,
        title: '记账数据导出',
      });
    } catch (error) {
      Alert.alert('导出失败', '无法导出数据');
    }
  };

  const handleExportCSV = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Create CSV header
    const headers = ['日期', '类型', '分类', '金额', '备注'];
    const rows = transactions.map(t => {
      const category = categories.find(c => c.id === t.categoryId);
      return [
        t.date,
        t.type === 'expense' ? '支出' : '收入',
        category?.name || '其他',
        t.amount.toString(),
        t.note || '',
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    try {
      await Share.share({
        message: csvContent,
        title: '记账数据CSV导出',
      });
    } catch (error) {
      Alert.alert('导出失败', '无法导出数据');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '清除数据',
      '确定要清除所有数据吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            // This would need a clearAllData function in AppContext
            Alert.alert('提示', '数据清除功能需要在AppContext中实现');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onPress,
    showArrow = true,
    danger = false,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: pressed ? colors.surface : colors.background },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: danger ? colors.expenseLight : colors.primaryLight }]}>
        <IconSymbol name={icon} size={20} color={danger ? colors.expense : colors.primary} />
      </View>
      <Text style={[styles.settingTitle, { color: danger ? colors.expense : colors.text }]}>
        {title}
      </Text>
      {value && (
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
      {showArrow && onPress && (
        <IconSymbol name="chevron-right" size={20} color={colors.muted} />
      )}
    </Pressable>
  );

  const totalTransactions = transactions.length;
  const customCategories = categories.filter(c => c.isCustom).length;
  const activeBudgets = budgets.length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>设置</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            数据管理
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="list-bullet"
              title="分类管理"
              value={`${customCategories} 个自定义`}
              onPress={() => router.push('/categories')}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="account-balance-wallet"
              title="预算设置"
              value={`${activeBudgets} 个预算`}
              onPress={() => router.push('/budget')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            导出数据
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="square.and.arrow.up"
              title="导出 JSON"
              onPress={handleExportData}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="square.and.arrow.down"
              title="导出 CSV"
              onPress={handleExportCSV}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            偏好设置
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="calendar"
              title="货币单位"
              value={settings.currency}
              onPress={() => Alert.alert('提示', '货币选择功能待实现')}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <SettingItem
              icon="pencil"
              title="语言"
              value={settings.language === 'zh-CN' ? '简体中文' : 'English'}
              onPress={() => Alert.alert('提示', '语言切换功能待实现')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            统计信息
          </Text>
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{totalTransactions}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>交易记录</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{customCategories}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>自定义分类</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{activeBudgets}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>预算项目</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <SettingItem
              icon="trash"
              title="清除所有数据"
              onPress={handleClearData}
              danger
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.muted }]}>
            记账本 v1.0.0
          </Text>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  separator: {
    height: 0.5,
    marginLeft: 64,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 0.5,
    height: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    fontSize: 13,
  },
});
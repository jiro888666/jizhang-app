import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/contexts/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency, getCurrentMonth, getMonthlyData, groupTransactionsByCategory } from '@/lib/utils';
import { Category } from '@/types';

const { width } = Dimensions.get('window');
const PIE_SIZE = Math.min(width - 64, 280);

type ViewType = 'expense' | 'income';
type PeriodType = 'month' | 'year';

export default function StatisticsScreen() {
  const { transactions, categories } = useApp();
  const colors = useColors();

  const [viewType, setViewType] = useState<ViewType>('expense');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionMonth = t.date.substring(0, 7);
      if (period === 'month') {
        return transactionMonth === selectedMonth;
      } else {
        return transactionMonth.startsWith(selectedMonth.substring(0, 4));
      }
    });
  }, [transactions, selectedMonth, period]);

  const categoryData = useMemo(() => {
    const typeFiltered = filteredTransactions.filter(t => t.type === viewType);
    return groupTransactionsByCategory(typeFiltered, categories);
  }, [filteredTransactions, viewType, categories]);

  const total = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryData]);

  const monthlyData = useMemo(() => {
    return getMonthlyData(transactions, viewType);
  }, [transactions, viewType]);

  const getCategoryInfo = (categoryId: string): Category => {
    return categories.find(c => c.id === categoryId) || {
      id: 'other',
      name: '其他',
      icon: 'more-horiz',
      color: '#64748B',
      type: viewType,
      isCustom: false,
    };
  };

  // Pie chart rendering
  const renderPieChart = () => {
    if (categoryData.length === 0) {
      return (
        <View style={[styles.piePlaceholder, { backgroundColor: colors.surface }]}>
          <IconSymbol name="chart-pie" size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            暂无数据
          </Text>
        </View>
      );
    }

    const centerX = PIE_SIZE / 2;
    const centerY = PIE_SIZE / 2;
    const radius = PIE_SIZE / 2 - 20;
    const innerRadius = radius * 0.55;

    let currentAngle = -Math.PI / 2;

    const slices = categoryData.map((item, index) => {
      const percentage = item.amount / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      const color = getCategoryInfo(item.categoryId).color || colors.primary;

      return {
        ...item,
        percentage,
        color,
        startAngle,
        endAngle,
      };
    });

    return (
      <View style={styles.pieContainer}>
        <svg width={PIE_SIZE} height={PIE_SIZE}>
          {slices.map((slice, index) => {
            const x1 = centerX + radius * Math.cos(slice.startAngle);
            const y1 = centerY + radius * Math.sin(slice.startAngle);
            const x2 = centerX + radius * Math.cos(slice.endAngle);
            const y2 = centerY + radius * Math.sin(slice.endAngle);
            const largeArc = slice.percentage > 0.5 ? 1 : 0;

            const path = `
              M ${centerX} ${centerY}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;

            return (
              <path
                key={index}
                d={path}
                fill={slice.color}
                stroke={colors.background}
                strokeWidth={2}
              />
            );
          })}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill={colors.background}
          />
        </svg>
        <View style={styles.pieCenter}>
          <Text style={[styles.pieTotalLabel, { color: colors.textSecondary }]}>
            {viewType === 'expense' ? '总支出' : '总收入'}
          </Text>
          <Text style={[styles.pieTotalAmount, { color: colors.text }]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    );
  };

  // Simple bar chart using Views
  const renderBarChart = () => {
    if (monthlyData.length === 0) {
      return (
        <View style={[styles.barPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            暂无数据
          </Text>
        </View>
      );
    }

    const maxValue = Math.max(...monthlyData.map(d => d.amount), 1);

    return (
      <View style={styles.barChartContainer}>
        {monthlyData.map((item, index) => {
          const height = (item.amount / maxValue) * 120;
          const color = viewType === 'expense' ? colors.expense : colors.income;

          return (
            <View key={index} style={styles.barColumn}>
              <Text style={[styles.barAmount, { color: colors.textSecondary }]}>
                {item.amount > 1000 ? `${Math.round(item.amount / 1000)}k` : Math.round(item.amount)}
              </Text>
              <View style={[styles.bar, { backgroundColor: color, height }]} />
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const viewTypes: ViewType[] = ['expense', 'income'];
  const viewTypeLabels: Record<ViewType, string> = {
    expense: '支出',
    income: '收入',
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>统计分析</Text>
      </View>

      <View style={styles.tabContainer}>
        {viewTypes.map((vt) => (
          <Pressable
            key={vt}
            style={[
              styles.tab,
              {
                backgroundColor: viewType === vt ? colors.primary : 'transparent',
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setViewType(vt)}
          >
            <Text style={[
              styles.tabText,
              { color: viewType === vt ? '#FFFFFF' : colors.primary },
            ]}>
              {viewTypeLabels[vt]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            分类占比
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            {renderPieChart()}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            月度趋势
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            {renderBarChart()}
          </View>
        </View>

        {categoryData.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              分类明细
            </Text>
            <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
              {categoryData.map((item, index) => {
                const category = getCategoryInfo(item.categoryId);
                const percentage = ((item.amount / total) * 100).toFixed(1);

                return (
                  <View
                    key={item.categoryId}
                    style={[
                      styles.listItem,
                      index < categoryData.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    <View style={styles.listRight}>
                      <Text style={[styles.listAmount, { color: colors.text }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text style={[styles.listPercentage, { color: colors.textSecondary }]}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  pieContainer: {
    width: PIE_SIZE,
    height: PIE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  pieTotalLabel: {
    fontSize: 13,
  },
  pieTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  piePlaceholder: {
    width: PIE_SIZE,
    height: PIE_SIZE,
    borderRadius: PIE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barAmount: {
    fontSize: 11,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  barPlaceholder: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  listPercentage: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
  },
});
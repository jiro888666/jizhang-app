import { Category, Transaction, Budget, Settings } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'food', name: '餐饮', icon: 'restaurant', color: '#F97316', type: 'expense', isCustom: false },
  { id: 'transport', name: '交通', icon: 'directions-car', color: '#3B82F6', type: 'expense', isCustom: false },
  { id: 'shopping', name: '购物', icon: 'shopping-bag', color: '#EC4899', type: 'expense', isCustom: false },
  { id: 'housing', name: '住房', icon: 'home', color: '#8B5CF6', type: 'expense', isCustom: false },
  { id: 'entertainment', name: '娱乐', icon: 'sports-esports', color: '#14B8A6', type: 'expense', isCustom: false },
  { id: 'education', name: '教育', icon: 'school', color: '#6366F1', type: 'expense', isCustom: false },
  { id: 'medical', name: '医疗', icon: 'local-hospital', color: '#EF4444', type: 'expense', isCustom: false },
  { id: 'other-expense', name: '其他', icon: 'more-horiz', color: '#64748B', type: 'expense', isCustom: false },
  // Income categories
  { id: 'salary', name: '工资', icon: 'account-balance-wallet', color: '#10B981', type: 'income', isCustom: false },
  { id: 'bonus', name: '奖金', icon: 'card-giftcard', color: '#F59E0B', type: 'income', isCustom: false },
  { id: 'investment', name: '投资', icon: 'trending-up', color: '#06B6D4', type: 'income', isCustom: false },
  { id: 'other-income', name: '其他', icon: 'more-horiz', color: '#64748B', type: 'income', isCustom: false },
];

export const DEFAULT_SETTINGS: Settings = {
  currency: 'CNY',
  language: 'zh-CN',
  theme: 'system',
};

export const STORAGE_KEYS = {
  TRANSACTIONS: 'jizhang_transactions',
  CATEGORIES: 'jizhang_categories',
  BUDGETS: 'jizhang_budgets',
  SETTINGS: 'jizhang_settings',
} as const;

export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  CNY: { symbol: '¥', name: '人民币' },
  USD: { symbol: '$', name: '美元' },
  EUR: { symbol: '€', name: '欧元' },
};
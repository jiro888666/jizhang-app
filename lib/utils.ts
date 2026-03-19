import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Transaction, Category, Budget } from '@/types';

export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
  };
  const symbol = symbols[currency] || '¥';
  return `${symbol}${amount.toFixed(2)}`;
};

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(new Date(date), formatStr);
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export const getDateRange = (period: 'week' | 'month' | 'year'): { start: Date; end: Date } => {
  const now = new Date();
  switch (period) {
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
  }
};

export const filterTransactionsByDate = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });
};

export const calculateBalance = (
  transactions: Transaction[]
): { income: number; expense: number; balance: number } => {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, balance: income - expense };
};

export const groupTransactionsByCategory = (
  transactions: Transaction[],
  categories: Category[]
): { categoryId: string; categoryName: string; amount: number; percentage: number; color: string }[] => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const grouped = new Map<string, number>();

  transactions.forEach((t) => {
    const current = grouped.get(t.categoryId) || 0;
    grouped.set(t.categoryId, current + t.amount);
  });

  const total = Array.from(grouped.values()).reduce((sum, a) => sum + a, 0);

  return Array.from(grouped.entries())
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        categoryName: category?.name || '未知',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: category?.color || '#64748B',
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

export const getMonthlyData = (
  transactions: Transaction[],
  months: number = 6
): { month: string; income: number; expense: number }[] => {
  const result: { month: string; income: number; expense: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const month = format(monthDate, 'yyyy-MM');
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const monthTransactions = filterTransactionsByDate(transactions, start, end);
    const { income, expense } = calculateBalance(monthTransactions);

    result.push({ month, income, expense });
  }

  return result;
};

export const groupTransactionsByDate = (
  transactions: Transaction[]
): { date: string; transactions: Transaction[] }[] => {
  const grouped = new Map<string, Transaction[]>();

  // Sort transactions by date descending
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sorted.forEach((t) => {
    const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, t]);
  });

  return Array.from(grouped.entries()).map(([date, transactions]) => ({
    date,
    transactions,
  }));
};

export const checkBudgetStatus = (
  budget: Budget,
  transactions: Transaction[]
): { spent: number; percentage: number; isOverBudget: boolean } => {
  const monthTransactions = transactions.filter((t) => {
    const transactionMonth = format(new Date(t.date), 'yyyy-MM');
    return transactionMonth === budget.month && t.type === 'expense';
  });

  const spent = budget.categoryId === 'total'
    ? monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    : monthTransactions
        .filter((t) => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);

  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return {
    spent,
    percentage,
    isOverBudget: spent > budget.amount,
  };
};
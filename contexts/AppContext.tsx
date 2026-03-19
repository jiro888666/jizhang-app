import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, Category, Budget, Settings } from '@/types';
import {
  getTransactions,
  saveTransactions,
  getCategories,
  saveCategories,
  getBudgets,
  saveBudgets,
  getSettings,
  saveSettings,
} from '@/lib/storage';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/lib/constants';

interface AppContextType {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;

  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedTransactions, loadedCategories, loadedBudgets, loadedSettings] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBudgets(),
        getSettings(),
      ]);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setBudgets(loadedBudgets);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    await saveTransactions(updated);
  }, [transactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    setTransactions(updated);
    await saveTransactions(updated);
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  }, [transactions]);

  // Category operations
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: generateId() };
    const updated = [...categories, newCategory];
    setCategories(updated);
    await saveCategories(updated);
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    await saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    // Don't delete if it's a default category
    const category = categories.find((c) => c.id === id);
    if (category && !category.isCustom) return;

    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await saveCategories(updated);
  }, [categories]);

  // Budget operations
  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...budget, id: generateId() };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await saveBudgets(updated);
  }, [budgets]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBudgets(updated);
    await saveBudgets(updated);
  }, [budgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    await saveBudgets(updated);
  }, [budgets]);

  // Settings operations
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        settings,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
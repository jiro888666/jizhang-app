import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget, Settings } from '@/types';
import { STORAGE_KEYS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './constants';

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

// Budgets
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
    throw error;
  }
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Export all data
export const exportAllData = async (): Promise<string> => {
  const [transactions, categories, budgets, settings] = await Promise.all([
    getTransactions(),
    getCategories(),
    getBudgets(),
    getSettings(),
  ]);
  return JSON.stringify({ transactions, categories, budgets, settings }, null, 2);
};

// Import all data
export const importAllData = async (jsonString: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions) await saveTransactions(data.transactions);
    if (data.categories) await saveCategories(data.categories);
    if (data.budgets) await saveBudgets(data.budgets);
    if (data.settings) await saveSettings(data.settings);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};
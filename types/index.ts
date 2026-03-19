export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  isCustom: boolean;
}

export interface Budget {
  id: string;
  categoryId: string | 'total';
  amount: number;
  month: string;
}

export interface Settings {
  currency: string;
  language: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark' | 'system';
}
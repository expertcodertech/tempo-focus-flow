export type Task = {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: 'study' | 'freelance' | 'break' | 'personal';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  isRecurring?: boolean;
  recurringPattern?: string;
};

export type FocusSession = {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  completedPomodoros: number;
  tag?: string;
  duration?: number; // Adding this field to fix the errors
  type?: string; // Adding this field to fix the error in FocusTimer.tsx
};

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'freelance'
  | 'other';

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  description: string;
  isRecurring?: boolean;
  recurringPattern?: string;
};

export type CalendarView = 'day' | 'week' | 'month';

export type ThemeMode = 'light' | 'dark';


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, FocusSession, Transaction, ThemeMode, CalendarView } from '@/types';

interface AppState {
  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Calendar
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
  
  // Focus Timer
  isTimerRunning: boolean;
  setTimerRunning: (isRunning: boolean) => void;
  pomodoroSettings: {
    focusDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };
  updatePomodoroSettings: (settings: Partial<AppState['pomodoroSettings']>) => void;
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  updateFocusSession: (sessionId: string, updates: Partial<FocusSession>) => void;
  
  // Expenses
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (transactionId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      themeMode: 'light',
      setThemeMode: (mode) => set({ themeMode: mode }),
      
      // Calendar
      tasks: [],
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, { ...task, id: uuidv4() }] 
      })),
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      })),
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId)
      })),
      calendarView: 'day',
      setCalendarView: (view) => set({ calendarView: view }),
      
      // Focus Timer
      isTimerRunning: false,
      setTimerRunning: (isRunning) => set({ isTimerRunning: isRunning }),
      pomodoroSettings: {
        focusDuration: 25, // minutes
        breakDuration: 5, // minutes
        longBreakDuration: 15, // minutes
        sessionsBeforeLongBreak: 4,
      },
      updatePomodoroSettings: (settings) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...settings }
      })),
      focusSessions: [],
      addFocusSession: (session) => set((state) => ({
        focusSessions: [...state.focusSessions, { ...session, id: uuidv4() }]
      })),
      updateFocusSession: (sessionId, updates) => set((state) => ({
        focusSessions: state.focusSessions.map((session) =>
          session.id === sessionId ? { ...session, ...updates } : session
        )
      })),
      
      // Expenses
      transactions: [],
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: uuidv4() }]
      })),
      updateTransaction: (transactionId, updates) => set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction.id === transactionId ? { ...transaction, ...updates } : transaction
        )
      })),
      deleteTransaction: (transactionId) => set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction.id !== transactionId)
      })),
    }),
    {
      name: 'tempo-focus-flow-storage',
    }
  )
);

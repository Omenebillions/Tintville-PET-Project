import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Cycle,
  Notification,
  RecurringExpense,
  Role,
  Settings,
  Transaction,
} from "../types";

interface AppState {
  role: Role;
  settings: Settings;
  cycles: Cycle[];
  transactions: Transaction[];
  notifications: Notification[];
}

interface AppContextType extends AppState {
  setRole: (role: Role) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addCycle: (cycle: Omit<Cycle, "id">) => void;
  updateCycle: (id: string, cycle: Partial<Cycle>) => void;
  deleteCycle: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  markNotificationsAsRead: () => void;
}

const defaultSettings: Settings = {
  buyPricePerKg: 600,
  sellPricePerKg: 1060,
  investorSharePercent: 0.3, // 30%
  minInvestmentPercent: 0.05, // 5% minimum of target fund needed
  investmentTerms: "Standard Terms:\n1. 12-Month Lock-in Period for principal investment.\n2. Option for buyout (Principal + Profit payout) or conversion to Business Equity proportional to investment share.\n3. Return on Investment is paid out periodically as cycles are completed.",
  recurringExpenses: [
    { id: "1", name: "Equipment Depreciation", amount: 50000 },
  ],
  notifications: [],
};

const initialState: AppState = {
  role: "admin",
  settings: defaultSettings,
  cycles: [],
  transactions: [],
  notifications: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("recycleflow_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Fix for previously saved duplicate IDs
        const seenCycles = new Set();
        parsed.cycles = parsed.cycles?.filter((c: any) => {
          if (seenCycles.has(c.id)) return false;
          seenCycles.add(c.id);
          return true;
        }) || [];
        
        const seenTx = new Set();
        parsed.transactions = parsed.transactions?.filter((t: any) => {
          if (seenTx.has(t.id)) return false;
          seenTx.add(t.id);
          return true;
        }) || [];

        return { ...initialState, ...parsed };
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem("recycleflow_state", JSON.stringify(state));
  }, [state]);

  const setRole = (role: Role) => setState((s) => ({ ...s, role }));

  const updateSettings = (newSettings: Partial<Settings>) => {
    setState((s) => {
      const updatedSettings = { ...s.settings, ...newSettings };

      const notifications = [...s.notifications];

      // If buy price or sell price changed significantly, add notification
      if (
        newSettings.buyPricePerKg !== undefined &&
        newSettings.buyPricePerKg !== s.settings.buyPricePerKg
      ) {
        notifications.unshift({
          id: Date.now().toString() + Math.random(),
          date: new Date().toISOString(),
          message: `Buy price updated to \u20A6${newSettings.buyPricePerKg}/kg`,
          read: false,
        });
      }
      if (
        newSettings.sellPricePerKg !== undefined &&
        newSettings.sellPricePerKg !== s.settings.sellPricePerKg
      ) {
        notifications.unshift({
          id: Date.now().toString() + Math.random(),
          date: new Date().toISOString(),
          message: `Sell price updated to \u20A6${newSettings.sellPricePerKg}/kg`,
          read: false,
        });
      }

      return {
        ...s,
        settings: updatedSettings,
        notifications,
      };
    });
  };

  const addCycle = (cycle: Omit<Cycle, "id">) => {
    const newCycle: Cycle = { ...cycle, id: Date.now().toString() + Math.random().toString(), targetFundNeeded: cycle.targetFundNeeded || 0, expectedPayment: cycle.expectedPayment || 0 };
    setState((s) => ({ ...s, cycles: [...s.cycles, newCycle] }));
  };

  const updateCycle = (id: string, updates: Partial<Cycle>) => {
    setState((s) => ({
      ...s,
      cycles: s.cycles.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteCycle = (id: string) => {
    setState((s) => ({
      ...s,
      cycles: s.cycles.filter((c) => c.id !== id),
    }));
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(),
    };
    setState((s) => ({
      ...s,
      transactions: [...s.transactions, newTransaction],
    }));
  };

  const deleteTransaction = (id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  };

  const markNotificationsAsRead = () => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setRole,
        updateSettings,
        addCycle,
        updateCycle,
        deleteCycle,
        addTransaction,
        deleteTransaction,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

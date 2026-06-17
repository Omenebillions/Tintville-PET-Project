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
  deleteCycle: (id: string, hard?: boolean) => void;
  restoreCycle: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string, hard?: boolean) => void;
  restoreTransaction: (id: string) => void;
  markNotificationsAsRead: () => void;
}

const defaultSettings: Settings = {
  buyPricePerKg: 300,
  sellPricePerKg: 510,
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

        // Self-heal prices if they are using the old defaults (600 / 1060)
        if (parsed.settings) {
          if (parsed.settings.buyPricePerKg === 600) {
            parsed.settings.buyPricePerKg = 300;
          }
          if (parsed.settings.sellPricePerKg === 1060) {
            parsed.settings.sellPricePerKg = 510;
          }
        }

        // Also heal default prices on any existing cycles
        parsed.cycles = (parsed.cycles || []).map((c: any) => {
          let updated = { ...c };
          let changed = false;
          if (c.buyPricePerKg === 600 || !c.buyPricePerKg) {
            updated.buyPricePerKg = 300;
            changed = true;
          }
          if (c.sellPricePerKg === 1060 || !c.sellPricePerKg) {
            updated.sellPricePerKg = 510;
            changed = true;
          }
          if (updated.totalKgCollected === 0 || updated.totalKgCollected === 1500 || !updated.totalKgCollected) {
            updated.totalKgCollected = 2000; // 2 tons
            changed = true;
          }
          if (!updated.expenses) {
            updated.expenses = {};
          }
          if (updated.expenses.transportCost === undefined) {
            updated.expenses.transportCost = 0;
            changed = true;
          }
          if (updated.expenses.laborCost === undefined) {
            updated.expenses.laborCost = 0;
            changed = true;
          }
          
          if (changed || true) {
            const material = updated.totalKgCollected * 300;
            updated.expenses.plasticPurchaseCost = material;
            
            const equip = updated.expenses.equipmentCostAllocated || 0;
            updated.expenses.equipmentCostAllocated = equip;
            
            // Total cost excludes equipment cost (not deducted yet)
            updated.totalExpenses = material + updated.expenses.transportCost + updated.expenses.laborCost + (updated.expenses.miscCost || 0);
            updated.revenue = updated.totalKgCollected * 510;
            updated.expectedPayment = updated.revenue;
            // Profit = revenue - running cost (plastic purchase + transport + added/misc cost)
            updated.netProfit = updated.revenue - (material + updated.expenses.transportCost + (updated.expenses.miscCost || 0));
            updated.investorPayout = updated.netProfit > 0 ? updated.netProfit * 0.3 : 0;
            updated.adminPayout = updated.netProfit > 0 ? updated.netProfit * 0.7 : updated.netProfit;
            
            updated.fundingItems = [
              { name: "2.0 Tons PET Plastic Purchase", amount: material, isEquipment: false },
              { name: "Transport Logistics", amount: updated.expenses.transportCost, isEquipment: false },
              { name: "Labor Sorter Deployment", amount: updated.expenses.laborCost, isEquipment: false }
            ];
          }
          return updated;
        });

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

  const deleteCycle = (id: string, hard?: boolean) => {
    setState((s) => {
      if (hard) {
        return {
          ...s,
          cycles: s.cycles.filter((c) => c.id !== id),
        };
      }
      return {
        ...s,
        cycles: s.cycles.map((c) =>
          c.id === id ? { ...c, isDeleted: true, deletedAt: new Date().toISOString() } : c
        ),
      };
    });
  };

  const restoreCycle = (id: string) => {
    setState((s) => ({
      ...s,
      cycles: s.cycles.map((c) => (c.id === id ? { ...c, isDeleted: false, deletedAt: undefined } : c)),
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

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTransaction = (id: string, hard?: boolean) => {
    setState((s) => {
      if (hard) {
        return {
          ...s,
          transactions: s.transactions.filter((t) => t.id !== id),
        };
      }
      return {
        ...s,
        transactions: s.transactions.map((t) =>
          t.id === id ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() } : t
        ),
      };
    });
  };

  const restoreTransaction = (id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, isDeleted: false, deletedAt: undefined } : t)),
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
        restoreCycle,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        restoreTransaction,
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

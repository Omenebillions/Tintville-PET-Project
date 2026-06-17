export type Role = "admin" | "investor";

export interface Settings {
  buyPricePerKg: number;
  sellPricePerKg: number;
  investorSharePercent: number; // e.g., 0.3 for 30%
  minInvestmentPercent: number; // min percentage of total fund needed to invest
  investmentTerms: string; // The terms shown the user
  recurringExpenses: RecurringExpense[];
  notifications: Notification[];
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
}

export interface Notification {
  id: string;
  date: string;
  message: string;
  read?: boolean;
}

export type CycleStatus = "awaiting_funds" | "collation" | "transport" | "payment_awaited" | "completed";

export interface FundingItem {
  name: string;
  amount: number;
  isEquipment?: boolean;
}

export interface CycleInvestor {
  id: string;
  name: string;
  amount: number;
  approved: boolean;
  date: string;
  paymentProof?: string;
}

export interface CycleStageExpense {
  id: string;
  name: string;
  amount: number;
  stage: CycleStatus;
  date: string;
}

export interface Cycle {
  id: string;
  name: string;
  date: string; // ISO date string
  status: CycleStatus;
  targetFundNeeded: number;
  expectedPayment: number;
  totalKgCollected: number;
  buyPricePerKg: number;
  sellPricePerKg: number;
  expenses: {
    plasticPurchaseCost: number;
    transportCost: number;
    laborCost: number;
    equipmentCostAllocated: number;
    miscCost: number;
  };
  revenue: number;
  totalExpenses: number;
  netProfit: number;
  investorPayout: number;
  adminPayout: number;
  fundingItems?: FundingItem[];
  investors?: CycleInvestor[];
  expensesList?: CycleStageExpense[];
}

export interface Transaction {
  id: string;
  date: string;
  type: "Expense" | "Income";
  category: string;
  description: string;
  amount: number;
  cycleId?: string;
}

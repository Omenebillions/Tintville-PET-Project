import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { cn, formatNaira } from "../lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { RecurringExpense } from "../types";

export default function SettingsPage() {
  const { settings, updateSettings, role } = useAppContext();
  const [buyPrice, setBuyPrice] = useState(settings.buyPricePerKg.toString());
  const [sellPrice, setSellPrice] = useState(
    settings.sellPricePerKg.toString(),
  );
  const [investorShare, setInvestorShare] = useState(
    (settings.investorSharePercent * 100).toString(),
  );
  const [minInvestment, setMinInvestment] = useState(
    (settings.minInvestmentPercent * 100).toString(),
  );
  const [investmentTerms, setInvestmentTerms] = useState(
    settings.investmentTerms || "",
  );
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  if (role !== "admin") {
    return <div className="p-6 text-center text-slate-500">Access Denied</div>;
  }

  const handleSavePrices = () => {
    updateSettings({
      buyPricePerKg: Number(buyPrice),
      sellPricePerKg: Number(sellPrice),
      investorSharePercent: Number(investorShare) / 100,
      minInvestmentPercent: Number(minInvestment) / 100,
      investmentTerms,
    });
    alert("Settings updated & investors notified!");
  };

  const handleAddExpense = () => {
    if (!newExpenseName || !newExpenseAmount) return;
    const newExp: RecurringExpense = {
      id: Date.now().toString() + Math.random().toString(),
      name: newExpenseName,
      amount: Number(newExpenseAmount),
    };
    updateSettings({
      recurringExpenses: [...settings.recurringExpenses, newExp],
    });
    setNewExpenseName("");
    setNewExpenseAmount("");
  };

  const handleRemoveExpense = (id: string) => {
    updateSettings({
      recurringExpenses: settings.recurringExpenses.filter((e) => e.id !== id),
    });
  };

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-hidden p-2">
        <div className="px-6 py-6 border-b border-natural-300 bg-natural-50 rounded-t-[2rem]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
            Global Pricing & Sharing
          </h3>
          <p className="text-xs text-natural-600 font-bold tracking-widest uppercase">
            Update rates here. This will notify investors immediately.
          </p>
        </div>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                Buy Price (per kg)
              </label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                Sell Price (per kg)
              </label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                Investor Share (%)
              </label>
              <input
                type="number"
                value={investorShare}
                onChange={(e) => setInvestorShare(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                Min. Investment (%)
              </label>
              <input
                type="number"
                value={minInvestment}
                onChange={(e) => setMinInvestment(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
              Investment Terms & Conditions
            </label>
            <textarea
              value={investmentTerms}
              onChange={(e) => setInvestmentTerms(e.target.value)}
              rows={4}
              className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 resize-none"
            />
            <p className="text-[10px] text-natural-500 mt-1 uppercase tracking-widest font-bold">Show to investors when funds are needed.</p>
          </div>
          <button
            onClick={handleSavePrices}
            className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-primary-dark transition shadow-md"
          >
            Save & Notify
          </button>
        </div>
      </div>

      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-hidden p-2">
        <div className="px-4 md:px-6 py-4 md:py-6 border-b border-natural-300 bg-natural-50 rounded-t-[2rem]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Recurring Expenses</h3>
          <p className="text-[10px] md:text-xs text-natural-600 font-bold tracking-widest uppercase">
            Expenses applied to every cycle (e.g., Equipment Depreciation).
          </p>
        </div>
        <div className="p-4 md:p-8">
          <div className="space-y-3 mb-6 md:mb-8">
            {settings.recurringExpenses.length === 0 && (
              <p className="text-sm text-natural-600 italic">
                No recurring expenses defined.
              </p>
            )}
            {settings.recurringExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 md:p-4 bg-natural-100 border border-natural-300 rounded-2xl font-bold"
              >
                <span className="text-[10px] md:text-sm text-natural-800 break-words pr-2">
                  {exp.name}
                </span>
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <span className="text-[10px] md:text-sm text-primary font-mono bg-white px-2 md:px-3 py-1 rounded-lg border border-natural-300">
                    {formatNaira(exp.amount)}
                  </span>
                  <button
                    onClick={() => handleRemoveExpense(exp.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 md:p-2 bg-white rounded-lg border border-natural-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-end bg-natural-50 p-4 md:p-6 rounded-[2rem] md:rounded-3xl border border-natural-300">
            <div className="flex-1 w-full">
              <label className="block text-[10px] md:text-xs font-bold text-natural-700 uppercase tracking-widest mb-1.5 md:mb-2">
                Expense Name
              </label>
              <input
                type="text"
                placeholder="e.g. Baler Allocation"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[10px] md:text-xs font-bold text-natural-700 uppercase tracking-widest mb-1.5 md:mb-2">
                Amount
              </label>
              <input
                type="number"
                placeholder="amount in NGN"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="block w-full rounded-xl border-natural-400 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
              />
            </div>
            <button
              onClick={handleAddExpense}
              className="w-full sm:w-auto bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-md h-[46px] sm:w-[46px] flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-5 h-5 hidden sm:block" />
              <span className="sm:hidden text-xs uppercase tracking-widest">Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

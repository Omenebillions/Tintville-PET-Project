import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function Ledger() {
  const { transactions, cycles } = useAppContext();
  const [activeTab, setActiveTab] = useState<"general" | "payouts">("general");

  // Sort descending by date
  const sortedTransactions = [...transactions]
    .filter(tx => tx.category !== "Investor Payout")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Using transactions to identify confirmed payment dates, or fallback to cycle date
  const getPayoutDate = (cycleId: string) => {
    const payoutTx = transactions.find(tx => tx.cycleId === cycleId && tx.category === "Investor Payout");
    if (payoutTx) return payoutTx.date;
    const completionTx = transactions.find(tx => tx.cycleId === cycleId && tx.category === "Cycle Revenue");
    if (completionTx) return completionTx.date;
    return undefined;
  };

  const payoutRecords = cycles
    .filter(c => c.status === "completed" && c.investorPayout > 0)
    .sort((a, b) => {
      const dateA = getPayoutDate(a.id) || a.date;
      const dateB = getPayoutDate(b.id) || b.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Financial Ledger
          </h3>
          <p className="text-[10px] sm:text-xs text-natural-600 font-bold uppercase tracking-widest mt-1">
            All income and expenses logged automatically.
          </p>
        </div>
        <div className="flex bg-natural-100 p-1 rounded-full border border-natural-300 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
              activeTab === "general" ? "bg-white shadow-sm text-natural-900 border border-natural-200" : "text-natural-500 hover:text-natural-800"
            )}
          >
            General Ledger
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
              activeTab === "payouts" ? "bg-white shadow-sm text-natural-900 border border-natural-200" : "text-natural-500 hover:text-natural-800"
            )}
          >
            Investor Payouts
          </button>
        </div>
      </div>

      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-x-auto p-2">
        {activeTab === "general" ? (
          sortedTransactions.length === 0 ? (
            <div className="p-8 text-center text-natural-600 italic">
              No general transactions recorded yet.
            </div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-natural-50 text-natural-600 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl rounded-bl-2xl">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right rounded-tr-2xl rounded-br-2xl">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100">
                  {sortedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-natural-50 transition cursor-pointer">
                      <td className="px-6 py-4 text-natural-700 whitespace-nowrap text-xs md:text-sm">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === "Income" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-natural-200 text-primary border border-natural-400">
                            <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5" /> Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-[#EAD6D6] text-red-700 border border-[#D5BDBD]">
                            <ArrowDownRight className="w-3 h-3 md:w-3.5 md:h-3.5" /> Expense
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-natural-900 text-xs md:text-sm">
                          {tx.category}
                        </div>
                        <div className="text-natural-600 text-[10px] md:text-xs mt-0.5">
                          {tx.description}
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-6 py-4 text-right font-bold text-xs md:text-sm whitespace-nowrap",
                          tx.type === "Income"
                            ? "text-primary"
                            : "text-natural-800",
                        )}
                      >
                        {tx.type === "Income" ? "+" : "-"}
                        {formatNaira(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          payoutRecords.length === 0 ? (
            <div className="p-8 text-center text-natural-600 italic">
              No investor payouts have been processed yet.
            </div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-natural-50 text-natural-600 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl rounded-bl-2xl">Payment Date</th>
                    <th className="px-6 py-4">Cycle ID / Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right rounded-tr-2xl rounded-br-2xl">Payout Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100">
                  {payoutRecords.map((cycle) => {
                    const paymentDate = getPayoutDate(cycle.id) || cycle.date;
                    return (
                      <tr key={cycle.id} className="hover:bg-natural-50 transition cursor-pointer">
                        <td className="px-6 py-4 text-natural-700 whitespace-nowrap text-xs md:text-sm font-bold">
                          {new Date(paymentDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-natural-900 text-xs md:text-sm">
                            {cycle.name}
                          </div>
                          <div className="text-natural-500 text-[10px] md:text-xs mt-0.5 font-mono">
                            {cycle.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-green-100 text-green-700 border border-green-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xs md:text-sm whitespace-nowrap text-primary">
                          {formatNaira(cycle.investorPayout)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

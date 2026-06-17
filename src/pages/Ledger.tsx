import React, { useState } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Trash2,
  Edit3,
  Download,
  AlertTriangle,
  RotateCcw,
  X,
  PlusCircle,
  Save,
} from "lucide-react";
import { Transaction } from "../types";

export default function Ledger() {
  const {
    transactions,
    cycles,
    role,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    addTransaction,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<"general" | "payouts" | "trash">("general");

  // Transaction Edit states
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<"Income" | "Expense">("Expense");

  // Warning confirm states
  const [warnDeleteTxId, setWarnDeleteTxId] = useState<string | null>(null);

  // Manual fast logging states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState("Miscellaneous");
  const [newDesc, setNewDesc] = useState("");
  const [newAmt, setNewAmt] = useState("");
  const [newType, setNewType] = useState<"Income" | "Expense">("Expense");

  // Filter out soft-deleted items for normal view
  const sortedTransactions = [...transactions]
    .filter((tx) => !tx.isDeleted && tx.category !== "Investor Payout")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Deleted transactions list
  const trashedTransactions = [...transactions]
    .filter((tx) => tx.isDeleted)
    .sort((a, b) => new Date(b.deletedAt || "").getTime() - new Date(a.deletedAt || "").getTime());

  // Confirmed payment tracking fallback
  const getPayoutDate = (cycleId: string) => {
    const payoutTx = transactions.find(
      (tx) => tx.cycleId === cycleId && tx.category === "Investor Payout"
    );
    if (payoutTx) return payoutTx.date;
    const completionTx = transactions.find(
      (tx) => tx.cycleId === cycleId && tx.category === "Cycle Revenue"
    );
    if (completionTx) return completionTx.date;
    return undefined;
  };

  const payoutRecords = cycles
    .filter((c) => !c.isDeleted && c.status === "completed" && c.investorPayout > 0)
    .sort((a, b) => {
      const dateA = getPayoutDate(a.id) || a.date;
      const dateB = getPayoutDate(b.id) || b.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  // Client-Side CSV Export Executor
  const handleExportCSV = () => {
    const headers = ["ID", "Date", "Type", "Category", "Description", "Amount (Naira)"];
    
    // Select correct records to download
    const records = activeTab === "trash" ? trashedTransactions : sortedTransactions;
    
    const rows = records.map((tx) => [
      tx.id,
      new Date(tx.date).toLocaleDateString(),
      tx.type,
      tx.category,
      tx.description || "",
      tx.amount,
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RecycleFlow_Ledger_Export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Select Item for editing
  const handleStartEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditCategory(tx.category);
    setEditDescription(tx.description || "");
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
  };

  // Save modified transaction values
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amtNum = Number(editAmount);
    if (isNaN(amtNum) || amtNum <= 0) return;

    updateTransaction(editingTx.id, {
      category: editCategory,
      description: editDescription,
      amount: amtNum,
      type: editType,
    });

    setEditingTx(null);
  };

  // Post entirely custom ledger entry
  const handlePostTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = Number(newAmt);
    if (isNaN(amtNum) || amtNum <= 0) return;

    addTransaction({
      date: new Date().toISOString(),
      type: newType,
      category: newCategory,
      description: newDesc,
      amount: amtNum,
    });

    setNewDesc("");
    setNewAmt("");
    setShowAddModal(false);
  };

  // Perform soft delete with safe trigger
  const confirmSoftDelete = (id: string) => {
    deleteTransaction(id); // default soft-deletes
    setWarnDeleteTxId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header bar and navigation toggles */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-natural-900">
            Financial Ledger & Ledger Audit
          </h2>
          <p className="text-[10px] sm:text-xs text-natural-600 font-bold uppercase tracking-widest mt-1">
            Reconciled records, transaction logs, and payout audits.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Main Action buttons */}
          {role === "admin" && (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 rounded-full text-xs font-bold uppercase tracking-widest transition"
              >
                <PlusCircle className="w-4 h-4" /> Log Entry
              </button>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-natural-800 hover:bg-natural-900 text-white rounded-full text-xs font-bold uppercase tracking-widest transition"
                title="Download spreadsheet of current list"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </>
          )}

          <div className="flex bg-natural-100 p-1 rounded-full border border-natural-300 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === "general"
                  ? "bg-white shadow-xs text-natural-900 border border-natural-200"
                  : "text-natural-500 hover:text-natural-800"
              )}
            >
              General Ledger
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === "payouts"
                  ? "bg-white shadow-xs text-natural-900 border border-natural-200"
                  : "text-natural-500 hover:text-natural-800"
              )}
            >
              Payouts
            </button>
            {role === "admin" && (
              <button
                onClick={() => setActiveTab("trash")}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5",
                  activeTab === "trash"
                    ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                    : "text-red-500 hover:text-red-800"
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Trash ({trashedTransactions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger display container */}
      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-hidden p-4 md:p-6">
        {activeTab === "general" && (
          sortedTransactions.length === 0 ? (
            <div className="p-12 text-center text-natural-500 italic text-sm">
              No general transactions recorded in Ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-natural-200 text-natural-600 font-bold uppercase text-[9px] tracking-wider bg-natural-50/50">
                    <th className="px-5 py-3 rounded-l-xl">Date</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Reference Category</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    {role === "admin" && <th className="px-5 py-3 text-center rounded-r-xl">Operations</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100 font-medium">
                  {sortedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-natural-50/50 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap text-natural-600">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {tx.type === "Income" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase">
                            <ArrowUpRight className="w-3 h-3" /> Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold bg-red-100 border border-red-200 text-red-700 uppercase">
                            <ArrowDownRight className="w-3 h-3" /> Expense
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-natural-900 whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="px-5 py-3.5 text-natural-600 max-w-xs truncate">
                        {tx.description || "N/A"}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 text-right font-bold font-mono",
                          tx.type === "Income" ? "text-primary text-sm" : "text-natural-900 text-xs"
                        )}
                      >
                        {tx.type === "Income" ? "+" : "-"}
                        {formatNaira(tx.amount)}
                      </td>

                      {/* Operations: Edit / Delete */}
                      {role === "admin" && (
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex gap-2.5 justify-center">
                            <button
                              onClick={() => handleStartEdit(tx)}
                              className="text-natural-600 hover:text-primary transition-colors p-1"
                              title="Edit transaction details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setWarnDeleteTxId(tx.id)}
                              className="text-natural-400 hover:text-red-600 transition-colors p-1"
                              title="Move transaction to trash bin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab 2: Payouts */}
        {activeTab === "payouts" && (
          payoutRecords.length === 0 ? (
            <div className="p-12 text-center text-natural-500 italic text-sm">
              No completed cycles have triggered payouts yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-natural-200 text-natural-600 font-bold uppercase text-[9px] tracking-wider bg-natural-50/50">
                    <th className="px-5 py-3 rounded-l-xl">Disbursement Date</th>
                    <th className="px-5 py-3">Cycle Reference</th>
                    <th className="px-5 py-3">Verification Status</th>
                    <th className="px-5 py-3 text-right rounded-r-xl">Disbursed Profit Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100 font-medium">
                  {payoutRecords.map((cycle) => {
                    const payDate = getPayoutDate(cycle.id) || cycle.date;
                    return (
                      <tr key={cycle.id} className="hover:bg-natural-50/50 transition">
                        <td className="px-5 py-3.5 text-natural-600 font-mono">
                          {new Date(payDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-natural-900">{cycle.name}</div>
                          <div className="text-[10px] text-natural-500 mt-0.5">ID: {cycle.id}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 border border-green-200 text-green-700 uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Fully Disbursed
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-primary font-mono text-sm">
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

        {/* Tab 3: Trash Bin */}
        {activeTab === "trash" && role === "admin" && (
          trashedTransactions.length === 0 ? (
            <div className="p-12 text-center text-natural-500 italic text-sm">
              Ledger Trash Bin is currently empty.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <p className="text-xs font-bold leading-normal">
                  You are viewing soft-deleted transactions. Restoring them reinterleaves them back into the active general ledger. Deleted items here can be permanently removed.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-natural-200 text-natural-600 font-bold uppercase text-[9px] tracking-wider bg-red-100/30">
                      <th className="px-5 py-3">Deleted At</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Reference Category</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-100 font-medium">
                    {trashedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-red-50/10 transition text-red-950">
                        <td className="px-5 py-3.5 text-[11px] font-mono text-natural-500">
                          {tx.deletedAt ? new Date(tx.deletedAt).toLocaleString() : "N/A"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold bg-neutral-100 text-neutral-800 border uppercase border-neutral-200">
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold">{tx.category}</td>
                        <td className="px-5 py-3.5 text-natural-600 text-xs italic">{tx.description}</td>
                        <td className="px-5 py-3.5 text-right font-bold font-mono">
                          {formatNaira(tx.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex gap-2.5 justify-center">
                            <button
                              onClick={() => restoreTransaction(tx.id)}
                              className="text-[#4A6741] hover:text-[#3B5433] bg-[#E8EFE5] border border-[#CBDCC4] px-2.5 py-1 rounded font-bold text-[10px] uppercase flex items-center gap-1 transition"
                              title="Restore back to general list"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id, true)}
                              className="text-white hover:bg-red-700 bg-red-600 px-2.5 py-1 rounded font-bold text-[10px] uppercase transition"
                              title="Erase permanently from device"
                            >
                              Hard Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Warning Overlay: Deletion Check */}
      {warnDeleteTxId && (
        <div className="fixed inset-0 bg-natural-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-xl max-w-md w-full p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-bold uppercase tracking-widest leading-none">
                Delete Ledger Transaction
              </h4>
            </div>
            <p className="text-xs text-natural-600 font-bold leading-relaxed">
              Choose your preferred deletion method. You can move this item to the Trash Bin (fully restorable) or delete it permanently from the ledger.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => confirmSoftDelete(warnDeleteTxId)}
                className="w-full bg-amber-650 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full hover:bg-amber-700 transition cursor-pointer"
              >
                Safe Delete (Move to Trash)
              </button>
              <button
                onClick={() => {
                  deleteTransaction(warnDeleteTxId, true); // Permanent delete
                  setWarnDeleteTxId(null);
                }}
                className="w-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full hover:bg-red-700 transition cursor-pointer"
              >
                Permanent Delete (Erase Completely)
              </button>
              <button
                onClick={() => setWarnDeleteTxId(null)}
                className="w-full bg-neutral-100 border border-natural-300 text-natural-800 font-bold text-xs uppercase tracking-wider py-3 rounded-full hover:bg-neutral-200 transition cursor-pointer"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Drawer: Log Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-natural-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-xl max-w-md w-full p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-natural-400 hover:text-natural-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
                Log Ledger Transaction
              </h3>
              <p className="text-[10px] text-natural-500 uppercase tracking-widest font-bold">
                Manually record miscellaneous administrative entries.
              </p>
            </div>

            <form onSubmit={handlePostTransaction} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Type of Entry
                </label>
                <div className="flex bg-natural-100 p-1 rounded-full border border-natural-300">
                  <button
                    type="button"
                    onClick={() => setNewType("Expense")}
                    className={cn(
                      "flex-1 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      newType === "Expense" ? "bg-white text-red-600 shadow-xs" : "text-natural-500"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("Income")}
                    className={cn(
                      "flex-1 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      newType === "Income" ? "bg-primary text-white shadow-xs" : "text-natural-500"
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Category Tag
                </label>
                <select
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-white border border-natural-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 shrink-0 select-none appearance-none"
                >
                  <option value="Miscellaneous">Miscellaneous Expense</option>
                  <option value="Transport / Logistics">Transport / Logistics</option>
                  <option value="Labor & Loading">Labor & Loading</option>
                  <option value="Equipment Purchase">Equipment Purchase (CapEx)</option>
                  <option value="Admin Reinvestment">Admin Reinvestment</option>
                  <option value="External Settlement">External Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Custom Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Offloading helper fee at warehouse"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs font-bold border border-natural-300 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Amount Transacted (₦)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Amount in Naira"
                  value={newAmt}
                  onChange={(e) => setNewAmt(e.target.value)}
                  className="w-full text-xs font-bold border border-natural-300 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full mt-4 transition"
              >
                Post to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay Drawer: Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-natural-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-xl max-w-md w-full p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setEditingTx(null)}
              className="absolute top-6 right-6 text-natural-400 hover:text-natural-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#cf903c] mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5" /> Edit Past Ledger Record
              </h3>
              <p className="text-[10px] text-natural-500 uppercase tracking-widest font-bold">
                Modify transaction fields. Saved changes instantly sync with cash metrics.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Type of Entry
                </label>
                <div className="flex bg-natural-100 p-1 rounded-full border border-natural-300">
                  <button
                    type="button"
                    onClick={() => setEditType("Expense")}
                    className={cn(
                      "flex-1 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      editType === "Expense" ? "bg-white text-red-600 shadow-xs" : "text-natural-500"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("Income")}
                    className={cn(
                      "flex-1 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      editType === "Income" ? "bg-primary text-white shadow-xs" : "text-natural-500"
                    )}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs font-bold border border-natural-300 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                  Custom Description
                </label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs font-bold border border-natural-300 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Amount Transacted (₦)
                </label>
                <input
                  type="number"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full text-xs font-bold border border-natural-300 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-[#cf802c] font-mono"
                />
              </div>

              <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl text-[10px] leading-relaxed border border-amber-200 font-bold">
                ⚠️ Modifying existing parameters impacts corporate stats models on the Admin dashboard. Ensure parameters match real bank settlements.
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full mt-4 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Edited values
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

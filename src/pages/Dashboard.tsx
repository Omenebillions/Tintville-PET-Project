import React, { useMemo, useState } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InvestorDashboard from "./InvestorDashboard";
import {
  RefreshCcw,
  Users,
  Check,
  X as XIcon,
  Plus,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  UserPlus,
  Coins,
  Info,
} from "lucide-react";

export default function Dashboard() {
  const { cycles, role, updateCycle, settings, addCycle } = useAppContext();

  // Manual Investor quick-add state
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [manualInvName, setManualInvName] = useState("");
  const [manualInvAmount, setManualInvAmount] = useState("");

  // Start New Cycle state
  const [showStartCycle, setShowStartCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [newCycleTons, setNewCycleTons] = useState("2.5");
  const [newCycleTransport, setNewCycleTransport] = useState<number>(250000);
  const [newCycleLabor, setNewCycleLabor] = useState<number>(100000);
  const [newCycleMisc, setNewCycleMisc] = useState<number>(50000);
  const [cycleSuccess, setCycleSuccess] = useState(false);

  // Only consider non-deleted cycles
  const activeCycleList = useMemo(() => {
    return cycles.filter((c) => !c.isDeleted && c.status !== "completed");
  }, [cycles]);

  const completedCycleList = useMemo(() => {
    return cycles.filter((c) => !c.isDeleted && c.status === "completed");
  }, [cycles]);

  // Aggregate stats based on completed cycles
  const stats = useMemo(() => {
    let totalKg = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    let netProfit = 0;
    let investorPayout = 0;

    completedCycleList.forEach((c) => {
      totalKg += c.totalKgCollected;
      totalRevenue += c.revenue;
      totalExpenses += c.totalExpenses;
      netProfit += c.netProfit;
      investorPayout += c.investorPayout;
    });

    return { totalKg, totalRevenue, totalExpenses, netProfit, investorPayout };
  }, [completedCycleList]);

  // Dynamic Available Operating Balance & Running Capital metric reflecting (Approved sourcing active funds for plastic/logistics) + corporate retention
  const runningCapitalInfo = useMemo(() => {
    // 1. Approved investment capital for active/ongoing cycles (allocated for buying plastic, transportation, logistics, and startup)
    const activeApprovedSourcingCapital = activeCycleList.reduce((sum, c) => {
      return sum + (c.investors || []).filter((i) => i.approved).reduce((s, i) => s + i.amount, 0);
    }, 0);

    // Active operational expenses spent so far (sourcing outlays)
    const activeOperationalSpent = activeCycleList.reduce((sum, c) => {
      const expensesListSum = (c.expensesList || []).reduce((s, e) => s + e.amount, 0);
      const isPlatDeducted = c.status !== "awaiting_funds" && c.status !== "collation";
      const plasticPurchaseCost = isPlatDeducted ? (c.expenses.plasticPurchaseCost || (c.totalKgCollected * (c.buyPricePerKg || 300))) : 0;
      return sum + expensesListSum + plasticPurchaseCost;
    }, 0);

    // Dynamic available capital pool remaining for sourcing PET plastic materials and logistical transportation
    const activeOperationsCapitalRemaining = Math.max(0, activeApprovedSourcingCapital - activeOperationalSpent);

    // 2. Previous cycle admin earnings picked from completed corporate finances
    const previousCycleAdminEarnings = completedCycleList.reduce((sum, c) => sum + (c.adminPayout || 0), 0);

    // Total Combined Running Capital
    const totalRunningCapital = activeOperationsCapitalRemaining + previousCycleAdminEarnings;

    return {
      activeApprovedSourcingCapital,
      activeOperationalSpent,
      activeOperationsCapitalRemaining,
      previousCycleAdminEarnings,
      totalRunningCapital
    };
  }, [completedCycleList, activeCycleList]);

  const availableCompanyBalance = runningCapitalInfo.totalRunningCapital;

  // Collect Recharts data
  const chartData = useMemo(() => {
    return completedCycleList
      .map((c) => ({
        name:
          c.name ||
          new Date(c.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
        kg: c.totalKgCollected,
        revenue: c.revenue,
        profit: c.netProfit,
      }))
      .slice(-6); // Last 6 completed cycles
  }, [completedCycleList]);

  // Approval queue: find all independent investors with approved = false across active cycles
  const pendingApprovals = useMemo(() => {
    const list: { cycleId: string; cycleName: string; investor: any }[] = [];
    cycles
      .filter((c) => !c.isDeleted)
      .forEach((c) => {
        (c.investors || []).forEach((inv) => {
          if (!inv.approved) {
            list.push({
              cycleId: c.id,
              cycleName: c.name,
              investor: inv,
            });
          }
        });
      });
    return list;
  }, [cycles]);

  // Approve a transaction
  const handleApproveInvestor = (cycleId: string, invId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;
    const updated = (cycle.investors || []).map((i) =>
      i.id === invId ? { ...i, approved: true } : i
    );
    updateCycle(cycleId, { investors: updated });
  };

  // Reject a transaction
  const handleRejectInvestor = (cycleId: string, invId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;
    const updated = (cycle.investors || []).filter((i) => i.id !== invId);
    updateCycle(cycleId, { investors: updated });
  };

  // Log pre-approved manual investor from dashboard
  const handleAddManualApproved = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleId || !manualInvName || !manualInvAmount) return;

    const cycle = cycles.find((c) => c.id === selectedCycleId);
    if (!cycle) return;

    const amountNum = Number(manualInvAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const totalApproved = (cycle.investors || []).filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0);
    const capacityLeft = Math.max(0, cycle.targetFundNeeded - totalApproved);

    if (capacityLeft <= 0) {
      alert("This operational cycle is already 100% funded! No more investments are allowed.");
      return;
    }

    if (amountNum > capacityLeft) {
      alert(`Only ₦${capacityLeft.toLocaleString()} in capacity is left under this campaign. You cannot record an investment exceeding this remaining amount.`);
      return;
    }

    const newInv = {
      id: Date.now().toString() + Math.random().toString(),
      name: manualInvName.trim(),
      amount: amountNum,
      approved: true, // Manual admin log entries are pre-approved
      date: new Date().toISOString(),
    };

    const updated = [...(cycle.investors || []), newInv];
    updateCycle(selectedCycleId, { investors: updated });

    // Reset controls
    setManualInvName("");
    setManualInvAmount("");
  };

  // Quick select helper percentage of needed fund
  const applyQuickPct = (pct: number) => {
    if (!selectedCycleId) return;
    const cycle = cycles.find((c) => c.id === selectedCycleId);
    if (!cycle) return;

    // Sourced so far
    const totalSourced = (cycle.investors || [])
      .filter((i) => i.approved)
      .reduce((sum, i) => sum + i.amount, 0);
    const needed = Math.max(0, cycle.targetFundNeeded - totalSourced);

    setManualInvAmount(Math.round(needed * pct).toString());
  };

  const handleCreateDashboardCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const tons = Math.max(Number(newCycleTons) || 1.5, 1.5);
    const kg = tons * 1000;
    const materialCost = kg * settings.buyPricePerKg;
    const totalBudget = materialCost + newCycleTransport + newCycleLabor + newCycleMisc;
    const revenue = kg * settings.sellPricePerKg;
    const netProfit = revenue - (materialCost + newCycleTransport + newCycleMisc);

    const recTotal = settings.recurringExpenses.reduce((sum, rx) => sum + rx.amount, 0);

    addCycle({
      name: newCycleName.trim() || `Cycle ${tons}T - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: "awaiting_funds",
      targetFundNeeded: totalBudget,
      expectedPayment: revenue,
      totalKgCollected: kg,
      buyPricePerKg: settings.buyPricePerKg,
      sellPricePerKg: settings.sellPricePerKg,
      expenses: {
        plasticPurchaseCost: materialCost,
        transportCost: newCycleTransport,
        laborCost: newCycleLabor,
        equipmentCostAllocated: recTotal,
        miscCost: newCycleMisc
      },
      revenue: revenue,
      totalExpenses: totalBudget,
      netProfit: netProfit,
      investorPayout: 0,
      adminPayout: 0,
      fundingItems: [
        { name: `${tons} Tons PET Plastic Purchase`, amount: materialCost, isEquipment: false },
        { name: "Transport Logistics Fee", amount: newCycleTransport, isEquipment: false },
        { name: "Labor/Sorter Recruitment Day-rate", amount: newCycleLabor, isEquipment: false },
        { name: "Direct Overheads/Misc Cost", amount: newCycleMisc, isEquipment: false }
      ],
      investors: [],
      expensesList: []
    });

    setCycleSuccess(true);
    setTimeout(() => {
      setCycleSuccess(false);
      setShowStartCycle(false);
      setNewCycleName("");
      setNewCycleTons("2.5");
    }, 2000);
  };

  if (role === "investor") {
    return <InvestorDashboard />;
  }

  // Calculate capacities for manual investment widget
  const selectedCycleData = selectedCycleId ? cycles.find((c) => c.id === selectedCycleId) : null;
  const selectedCycleTotalApproved = selectedCycleData
    ? (selectedCycleData.investors || []).filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0)
    : 0;
  const selectedCycleCapacityLeft = selectedCycleData
    ? Math.max(0, selectedCycleData.targetFundNeeded - selectedCycleTotalApproved)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title & Start Cycle Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-natural-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Admin Operations Control
          </h2>
          <p className="text-[10px] sm:text-xs text-natural-600 font-bold uppercase tracking-widest mt-1">
            Real-time liquid capital status, pending wire queue, and active campaign logs.
          </p>
        </div>
        <button
          onClick={() => setShowStartCycle(!showStartCycle)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md shrink-0 cursor-pointer"
        >
          {showStartCycle ? (
            <>
              <XIcon className="w-4 h-4" /> Close Planner
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 animate-pulse" /> Start New Cycle
            </>
          )}
        </button>
      </div>

      {/* Start New Cycle Form Card with Goal Auto-Calculator */}
      {showStartCycle && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-sm space-y-6">
          <div className="border-b border-natural-200 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Plus className="w-5 h-5" /> Start New Operating Cycle
            </h3>
            <p className="text-xs text-natural-500 uppercase font-bold tracking-wider mt-1">
              Configure material volumes, logistical outlays, and launch a new pro-rata investment rounds.
            </p>
          </div>

          <form onSubmit={handleCreateDashboardCycle} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Funding Round Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. November Batch Round A"
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                  className="w-full text-xs font-bold border-natural-300 border px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5 flex justify-between">
                  <span>Target Tonnage (PET)</span>
                  <span className="text-primary font-mono text-[9px] font-bold">Min: 1.5 Tons</span>
                </label>
                <input
                  type="number"
                  required
                  min="1.5"
                  step="0.1"
                  value={newCycleTons}
                  onChange={(e) => setNewCycleTons(e.target.value)}
                  className="w-full text-xs font-bold border-natural-300 border px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Transportation & Logistics (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={newCycleTransport}
                  onChange={(e) => setNewCycleTransport(Number(e.target.value))}
                  className="w-full text-xs font-semibold border-natural-300 border px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Labor & Sorting Personnel (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={newCycleLabor}
                  onChange={(e) => setNewCycleLabor(Number(e.target.value))}
                  className="w-full text-xs font-semibold border-natural-300 border px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                  Miscellaneous / Running Overheads (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={newCycleMisc}
                  onChange={(e) => setNewCycleMisc(Number(e.target.value))}
                  className="w-full text-xs font-semibold border-natural-300 border px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono"
                />
              </div>

              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <span className="block text-[9px] text-natural-500 font-bold uppercase tracking-widest mb-1.5">
                  Active Pricing Blueprint & Core Parameters
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-natural-800">
                  <div>Buy Price: <span className="text-primary">{formatNaira(settings.buyPricePerKg)}/kg</span></div>
                  <div>Sell Price: <span className="text-[#bf7e21]">{formatNaira(settings.sellPricePerKg)}/kg</span></div>
                </div>
              </div>
            </div>

            {/* Live Goal Calculation Panel */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="block text-[9px] text-natural-500 font-bold uppercase tracking-widest leading-none mb-1">
                  Plastic Material Budget
                </span>
                <span className="text-xs font-bold text-natural-700">
                  {(Number(newCycleTons) * 1000).toLocaleString()} kg @ {formatNaira(settings.buyPricePerKg)}/kg
                </span>
                <span className="block text-lg font-serif font-bold text-natural-950 mt-1">
                  {formatNaira(Number(newCycleTons) * 1000 * settings.buyPricePerKg)}
                </span>
              </div>

              <div className="border-t md:border-t-0 md:border-x border-natural-200 pt-4 md:pt-0 md:px-6">
                <span className="block text-[9px] text-primary font-bold uppercase tracking-widest leading-none mb-1">
                  TARGET GOAL FUNDING REQUIRED
                </span>
                <span className="text-[10px] text-natural-600 font-bold leading-normal block">
                  Total capital commitment needed from investors to execute this run
                </span>
                <span className="block text-2xl font-serif font-bold text-primary mt-1">
                  {formatNaira((Number(newCycleTons) * 1000 * settings.buyPricePerKg) + newCycleTransport + newCycleLabor + newCycleMisc)}
                </span>
              </div>

              <div>
                <span className="block text-[9px] text-[#bf7e21] font-bold uppercase tracking-widest leading-none mb-1">
                  Expected Financial Performance
                </span>
                <span className="text-[10px] text-natural-600 block">
                  Gross Yield: {formatNaira((Number(newCycleTons) * 1000) * settings.sellPricePerKg)}
                </span>
                <span className="block text-base font-mono font-bold text-[#bf7e21] mt-1">
                  Net profit: {formatNaira(((Number(newCycleTons) * 1000) * settings.sellPricePerKg) - (((Number(newCycleTons) * 1000) * settings.buyPricePerKg) + newCycleTransport + newCycleMisc))}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowStartCycle(false)}
                className="px-6 py-2.5 bg-neutral-100 text-natural-700 hover:bg-neutral-200 text-[11px] font-bold uppercase tracking-widest rounded-full transition"
              >
                Cancel Draft
              </button>
              <button
                type="submit"
                disabled={cycleSuccess}
                className={cn(
                  "px-8 py-2.5 text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-md transition-all cursor-pointer",
                  cycleSuccess ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary-dark"
                )}
              >
                {cycleSuccess ? "✓ Cycle Launched!" : "Launch Operational Round"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {/* Available Balance after Profit Share (Running Capital) */}
        <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-200 shadow-sm flex flex-col justify-between h-36 min-w-0">
          <span className="text-[10px] md:text-xs text-amber-900 font-bold uppercase tracking-widest flex items-center justify-between gap-1">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0" /> Running Capital
            </span>
            <div className="group relative cursor-pointer inline-block shrink-0">
              <Info className="w-4 h-4 text-amber-700 hover:text-amber-900" />
              <div className="pointer-events-none absolute bottom-full right-0 lg:left-0 lg:right-auto mb-2 w-72 p-4 bg-natural-900 text-white rounded-2xl text-[10px] font-medium tracking-normal leading-relaxed shadow-xl opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 transition-opacity duration-200 z-50">
                <span className="block font-bold text-amber-400 mb-1.5 uppercase tracking-wider text-[11px] border-b border-natural-700 pb-1">
                  Capital Treasury Breakdown:
                </span>
                <div className="space-y-1 text-natural-300 font-bold">
                  <div>
                    Sourcing Pool (Buying plastic + Logistics):
                    <span className="block text-white font-mono mt-0.5">
                      {formatNaira(runningCapitalInfo.activeOperationsCapitalRemaining)}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-natural-800">
                    Corporate Finances (Admin Retained Profits):
                    <span className="block text-white font-mono mt-0.5">
                      {formatNaira(runningCapitalInfo.previousCycleAdminEarnings)}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t-2 border-amber-400/30 text-amber-300 flex justify-between font-bold text-[11px]">
                    <span>Total Running Capital:</span>
                    <span>{formatNaira(runningCapitalInfo.totalRunningCapital)}</span>
                  </div>
                </div>
              </div>
            </div>
          </span>
          <div className="flex items-baseline mt-auto">
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-xl xl:text-[22px] font-serif font-bold text-amber-950 tracking-tight leading-none break-words">
              {formatNaira(availableCompanyBalance)}
            </span>
          </div>
          <span className="block text-[9px] text-amber-700 font-bold uppercase mt-1 leading-none">
            Operating Cash & Retained Earnings
          </span>
        </div>

        {/* Total Processed */}
        <div className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm flex flex-col justify-between h-36 min-w-0">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest truncate">
            Processed Volume (PET)
          </span>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-natural-800">
              {stats.totalKg.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary">kg</span>
          </div>
          <span className="block text-[9px] text-natural-500 font-bold uppercase mt-1 leading-none">
            From {completedCycleList.length} completed cycles
          </span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm flex flex-col justify-between h-36 min-w-0">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest truncate">
            Total Revenue
          </span>
          <div className="flex items-baseline mt-auto">
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-xl xl:text-[22px] font-serif font-bold text-natural-800 tracking-tight leading-none break-words">
              {formatNaira(stats.totalRevenue)}
            </span>
          </div>
          <span className="block text-[9px] text-natural-500 font-bold uppercase mt-1 leading-none">
            Gross customer settlement value
          </span>
        </div>

        {/* System Net Profit */}
        <div className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm flex flex-col justify-between h-36 min-w-0">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest truncate">
            System Net Profit
          </span>
          <div className="flex items-baseline mt-auto">
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-xl xl:text-[22px] font-serif font-bold text-primary tracking-tight leading-none break-words">
              {formatNaira(stats.netProfit)}
            </span>
          </div>
          <span className="block text-[9px] text-natural-500 font-bold uppercase mt-1 leading-none">
            Turnover minus cost structures
          </span>
        </div>

        {/* Investor Payouts Paid */}
        <div className="bg-primary p-6 rounded-[2rem] shadow-sm flex flex-col justify-between text-white h-36 min-w-0">
          <span className="text-[10px] md:text-xs opacity-70 font-bold uppercase tracking-widest truncate">
            Investor Payouts Paid
          </span>
          <div className="flex items-baseline mt-auto">
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-xl xl:text-[22px] font-serif font-bold tracking-tight leading-none break-words">
              {formatNaira(stats.investorPayout)}
            </span>
          </div>
          <span className="block text-[9px] opacity-70 font-bold uppercase mt-1 leading-none">
            Paid from {Math.round(settings.investorSharePercent * 100)}% profit model
          </span>
        </div>
      </div>

      {/* Synchronized Live Funding & Active Operations Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cycles Status Container */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <RefreshCcw className="w-4.5 h-4.5 animate-spin-slow" /> Active Funding & Ongoing Operations
              </h3>
              <span className="px-2.5 py-1 bg-natural-100 rounded-full text-[10px] font-bold text-natural-700">
                {activeCycleList.length} Active Rounds
              </span>
            </div>

            {activeCycleList.length === 0 ? (
              <div className="py-12 text-center text-natural-500 italic text-sm border-2 border-dashed border-natural-200 rounded-2xl bg-natural-50/50">
                No active recycling operations requesting funds. Start a new round to begin sourcing.
              </div>
            ) : (
              <div className="space-y-5">
                {activeCycleList.map((cycle) => {
                  const totalApproved = (cycle.investors || [])
                    .filter((i) => i.approved)
                    .reduce((sum, i) => sum + i.amount, 0);
                  const progressPct = Math.min(
                    100,
                    (totalApproved / (cycle.targetFundNeeded || 1)) * 100
                  );

                  // Calculate live operating balances
                  const additionalExpenses = (cycle.expensesList || []).reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const isPlatDeducted = cycle.status !== "awaiting_funds" && cycle.status !== "collation";
                  const platPurchase = cycle.expenses.plasticPurchaseCost || (cycle.totalKgCollected * cycle.buyPricePerKg);
                  const actPlatCost = isPlatDeducted ? platPurchase : 0;

                  const isTranspCompleted = cycle.status === "payment_awaited" || cycle.status === "completed";
                  const actTransCost = isTranspCompleted ? cycle.expenses.transportCost : 0;
                  const actLabCost = isTranspCompleted ? cycle.expenses.laborCost : 0;

                  const currentLiveBalance = totalApproved - additionalExpenses - actPlatCost - actTransCost - actLabCost;

                  return (
                    <div
                      key={cycle.id}
                      className="p-4 bg-natural-50 border border-natural-200 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 hover:border-primary/40 transition"
                    >
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-natural-900 leading-tight">
                              {cycle.name}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest">
                              {cycle.status.replace("_", " ")}
                            </span>
                          </div>
                          <span className="text-[10px] text-natural-500 font-bold uppercase mt-0.5 block">
                            Requested Date: {new Date(cycle.date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Sourced Capital progress bar */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-natural-600 mb-1 font-mono">
                            <span>Sourced Capital</span>
                            <span>
                              {formatNaira(totalApproved)} / {formatNaira(cycle.targetFundNeeded)}
                            </span>
                          </div>
                          <div className="w-full bg-natural-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="block text-[9px] font-bold text-primary mt-1">
                            {progressPct.toFixed(1)}% Funded Pro-rata
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right flex flex-col justify-between items-start sm:items-end shrink-0 pl-1">
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-natural-200">
                          <span className="block text-[8px] text-natural-500 font-bold uppercase tracking-wider">
                            Active Operating Cash
                          </span>
                          <span className="block text-xs font-mono font-bold text-natural-900">
                            {formatNaira(currentLiveBalance)}
                          </span>
                        </div>
                        <span className="text-[9px] text-natural-500 font-bold uppercase tracking-widest mt-2 sm:mt-0">
                          Needs: {formatNaira(Math.max(0, cycle.targetFundNeeded - totalApproved))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Manual Investor Quick Logger Widget */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <UserPlus className="w-4.5 h-4.5" /> Hand-Key Manual Investor
            </h3>
            <p className="text-[11px] text-natural-600 font-bold uppercase tracking-widest mb-4 leading-normal">
              Directly log pre-approved cash contributions into any active cycle.
            </p>

            {activeCycleList.length === 0 ? (
              <p className="text-xs text-natural-500 italic py-6 text-center">
                Create an active cycle first to manually attribute funding.
              </p>
            ) : (
              <form onSubmit={handleAddManualApproved} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                    Target Operating Cycle
                  </label>
                  <select
                    required
                    value={selectedCycleId}
                    onChange={(e) => setSelectedCycleId(e.target.value)}
                    className="w-full text-xs font-bold p-3 bg-white border border-natural-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 shrink-0 select-none appearance-none"
                  >
                    <option value="">Select Operational Cycle...</option>
                    {activeCycleList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCycleId && (
                  <div className="space-y-2">
                    {selectedCycleCapacityLeft <= 0 ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-xl leading-normal">
                        ⚠️ This cycle is 100% funded! No further investments allowed.
                      </div>
                    ) : (
                      <div className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Target Remaining capacity: {formatNaira(selectedCycleCapacityLeft)} ({((selectedCycleCapacityLeft / (selectedCycleData?.targetFundNeeded || 1)) * 100).toFixed(1)}% Left)
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                    Investor's Full Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={selectedCycleId && selectedCycleCapacityLeft <= 0}
                    placeholder="e.g. Alhaji Shittu Gara"
                    value={manualInvName}
                    onChange={(e) => setManualInvName(e.target.value)}
                    className="w-full text-xs font-bold border-natural-300 border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 disabled:bg-natural-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1.5">
                    Investment Capital (₦)
                  </label>
                  <input
                    type="number"
                    required
                    disabled={selectedCycleId && selectedCycleCapacityLeft <= 0}
                    max={selectedCycleCapacityLeft}
                    placeholder="e.g. 150000"
                    value={manualInvAmount}
                    onChange={(e) => setManualInvAmount(e.target.value)}
                    className="w-full text-xs font-bold border-natural-300 border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary text-natural-900 font-mono disabled:bg-natural-100 disabled:cursor-not-allowed"
                  />

                  {/* Fraction tools for requested percentage quick fill */}
                  {selectedCycleId && selectedCycleCapacityLeft > 0 && (
                    <div className="mt-2 text-left">
                      <span className="block text-[8px] text-natural-500 font-bold uppercase tracking-wider mb-1">
                        Select Share of Remaining Needed Funds
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => applyQuickPct(pct)}
                            className="bg-natural-100 border border-natural-300 rounded text-[9px] py-1 font-bold font-mono text-natural-700 hover:bg-natural-200 transition"
                          >
                            {pct * 100}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!selectedCycleId || selectedCycleCapacityLeft <= 0}
                  className="w-full bg-primary text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 disabled:hover:bg-primary disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Confirm & Post Investment
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Verification Queue (Pending Investor proof submissions) */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#cf903c] mb-4 flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" /> Sourced Bank Proof Approval Queue
        </h3>
        <p className="text-xs text-natural-600 leading-relaxed mb-6 font-bold max-w-2xl">
          Investors submitting capital commitments on their dashboards are queued here. Confirm receipt of funds in the bank account, then approve to instantly release operating balance into active cycle parameters.
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="py-10 text-center text-natural-500 italic text-xs bg-natural-50 border border-natural-200 rounded-2xl font-bold uppercase tracking-widest">
            Approval queue empty. No pending payments awaiting verification.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px] border-collapse">
              <thead>
                <tr className="border-b border-natural-200 text-natural-600 font-bold uppercase text-[9px] tracking-wider bg-natural-50/50">
                  <th className="px-4 py-3 rounded-l-xl">Cycle Target</th>
                  <th className="px-4 py-3">Logged Investor</th>
                  <th className="px-4 py-3 text-right">Fund Amount</th>
                  <th className="px-4 py-3">Submission Type</th>
                  <th className="px-4 py-3 text-center rounded-r-xl">Action Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-100 font-medium">
                {pendingApprovals.map((item, idx) => (
                  <tr key={idx} className="hover:bg-natural-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-natural-900">{item.cycleName}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-natural-900">{item.investor.name}</div>
                      <div className="text-[10px] text-natural-500 mt-0.5">
                        {new Date(item.investor.date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-primary font-mono">
                      {formatNaira(item.investor.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.investor.paymentProof ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-[#E8AE3D]/10 text-[#cf802c] border border-[#E8AE3D]/20 uppercase">
                          Bank Wire Proof Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-natural-200 text-natural-700 border border-natural-300 uppercase">
                          Pledge Commitment Only
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex gap-2 justify-center">
                        <button
                          onClick={() => handleApproveInvestor(item.cycleId, item.investor.id)}
                          className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors border border-primary flex items-center gap-1 text-[10px] uppercase font-bold"
                          title="Verify receipt and release capital"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectInvestor(item.cycleId, item.investor.id)}
                          className="bg-white hover:bg-red-50 text-red-600 p-2 rounded-lg transition-colors border border-red-300 flex items-center gap-1 text-[10px] uppercase font-bold"
                          title="Reject and discard request"
                        >
                          <XIcon className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Completed Performances and Volume Statistics */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5" /> Historical Performance Analytical Output
        </h3>
        {chartData.length > 0 ? (
          <div className="h-64 md:h-80 -ml-5 md:ml-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D6D9CE" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#828D7A", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: "#828D7A", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  tick={{ fill: "#828D7A", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(v) => `\u20A6${v / 1000000}M`}
                />
                <Tooltip
                  cursor={{ fill: "#F0F2E8" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #D6D9CE",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    color: "#2D3A28",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "kg")
                      return [value.toLocaleString() + " kg", "Volume Processed"];
                    return [
                      formatNaira(value),
                      name === "revenue" ? "Revenue" : "Net Profit",
                    ];
                  }}
                />
                <Bar yAxisId="left" dataKey="kg" fill="#CBD1B4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="revenue" fill="#828D7A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="profit" fill="#4A6741" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-natural-600 italic bg-natural-50 rounded-[1.5rem] text-sm">
            No completed cycles to display yet.
          </div>
        )}
      </div>
    </div>
  );
}

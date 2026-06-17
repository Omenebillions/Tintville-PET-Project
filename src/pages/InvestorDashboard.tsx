import React, { useMemo, useState } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import { TrendingUp, Package, ChevronRight, Activity, Wallet, X, PieChart, Coins, ScrollText, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Cycle } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function InvestorDashboard() {
  const { cycles, settings, updateCycle, addCycle } = useAppContext();
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>("0");
  const [paymentStage, setPaymentStage] = useState(false);
  const [investorName, setInvestorName] = useState("");

  // Quick Cycle Creator & Seeder state
  const [showCreator, setShowCreator] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [newCycleTons, setNewCycleTons] = useState("2.5");
  const [newCycleTransport, setNewCycleTransport] = useState<number>(250000);
  const [newCycleLabor, setNewCycleLabor] = useState<number>(100000);
  const [newCycleMisc, setNewCycleMisc] = useState<number>(50000);
  const [seedFunding, setSeedFunding] = useState<"none" | "partial" | "full">("full");
  const [seedAmount, setSeedAmount] = useState<string>("");
  const [seedInvestorName, setSeedInvestorName] = useState("");
  const [isCreatorSuccess, setIsCreatorSuccess] = useState(false);

  const activeCycles = cycles.filter(c => !c.isDeleted && c.status !== "completed");
  const completedCycles = cycles.filter(c => !c.isDeleted && c.status === "completed");

  const portfolio = useMemo(() => {
    let totalInvested = 0;
    let totalReturned = 0;

    activeCycles.forEach(c => {
      const approvedAmt = (c.investors || []).filter(inv => inv.approved).reduce((sum, inv) => sum + inv.amount, 0);
      totalInvested += approvedAmt;
    });

    completedCycles.forEach(c => {
      const approvedAmt = (c.investors || []).filter(inv => inv.approved).reduce((sum, inv) => sum + inv.amount, 0);
      totalInvested += approvedAmt;
      totalReturned += c.investorPayout;
    });

    return { totalInvested, totalReturned };
  }, [activeCycles, completedCycles]);

  const chartData = useMemo(() => {
    return [...cycles]
      .filter(c => !c.isDeleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(c => {
        const cBuy = c.buyPricePerKg || settings.buyPricePerKg;
        const cSell = c.sellPricePerKg || settings.sellPricePerKg;
        const cKg = c.totalKgCollected || 2000;
        const cTransport = c.expenses?.transportCost || 250000;
        const cMisc = c.expenses?.miscCost || 0;
        const cRevenue = c.expectedPayment || (cKg * cSell);
        const cRunningCapital = (cKg * cBuy) + cTransport + cMisc;
        // CAPEX is not deducted from revenue, net profit is revenue minus running cost (including added/misc cost during cycle)
        const expectedReturn = Math.max(0, (cRevenue - cRunningCapital) * settings.investorSharePercent);
        const totalApprovedInCycle = (c.investors || []).filter(i => i.approved).reduce((sum, i) => sum + i.amount, 0);
        return {
          name: c.name,
          date: new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          "Capital Deployed": totalApprovedInCycle,
          "Returns Earned": c.status === "completed" ? c.investorPayout : 0,
          "Projected Returns": c.status !== "completed" ? expectedReturn : 0,
        };
      });
  }, [cycles, settings]);

  const closeModal = () => {
    setSelectedCycle(null);
    setInvestmentAmount("0");
    setPaymentStage(false);
  };

  const handleCycleSelect = (cycle: Cycle) => {
    setSelectedCycle(cycle);
    const totalApproved = (cycle.investors || []).filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0);
    const capacityLeft = Math.max(0, cycle.targetFundNeeded - totalApproved);
    const normalMin = cycle.targetFundNeeded * settings.minInvestmentPercent;
    const initialAmt = capacityLeft > 0 ? Math.min(normalMin, capacityLeft) : 0;
    setInvestmentAmount(initialAmt.toString());
    setPaymentStage(false);
  };

  const calculatedTons = Math.max(Number(newCycleTons) || 1.5, 1.5);
  const calculatedKg = calculatedTons * 1000;
  const calculatedMaterialCost = calculatedKg * settings.buyPricePerKg;
  const calculatedTotalBudget = calculatedMaterialCost + newCycleTransport + newCycleLabor + newCycleMisc;
  const calculatedRevenue = calculatedKg * settings.sellPricePerKg;
  const calculatedNetProfit = calculatedRevenue - (calculatedMaterialCost + newCycleTransport + newCycleMisc);
  const calculatedInvestorPayout = calculatedNetProfit > 0 ? calculatedNetProfit * settings.investorSharePercent : 0;

  const handleCreateAndFund = (e: React.FormEvent) => {
    e.preventDefault();
    
    let initialInvestors: any[] = [];
    let initialStatus: Cycle["status"] = "awaiting_funds";
    
    const finalSeedAmt = seedFunding === "full" 
      ? calculatedTotalBudget 
      : seedFunding === "partial" 
        ? Math.min(Number(seedAmount) || 0, calculatedTotalBudget)
        : 0;
        
    if (finalSeedAmt > 0) {
      initialInvestors = [
        {
          id: Date.now().toString() + Math.random().toString(),
          name: seedInvestorName.trim() || "Lead Capital Partner",
          amount: finalSeedAmt,
          approved: true, // Direct instant seed approval
          date: new Date().toISOString()
        }
      ];
      if (finalSeedAmt >= calculatedTotalBudget) {
        initialStatus = "collation";
      }
    }

    const recTotal = settings.recurringExpenses.reduce((sum, rx) => sum + rx.amount, 0);

    addCycle({
      name: newCycleName.trim() || `Tonnage Batch ${calculatedTons}T - ${new Date().toLocaleDateString("en-NG", { month: "short", year: "numeric", day: "numeric" })}`,
      date: new Date().toISOString(),
      status: initialStatus,
      targetFundNeeded: calculatedTotalBudget,
      expectedPayment: calculatedRevenue,
      totalKgCollected: calculatedKg,
      buyPricePerKg: settings.buyPricePerKg,
      sellPricePerKg: settings.sellPricePerKg,
      expenses: {
        plasticPurchaseCost: calculatedMaterialCost,
        transportCost: newCycleTransport,
        laborCost: newCycleLabor,
        equipmentCostAllocated: recTotal,
        miscCost: newCycleMisc
      },
      revenue: calculatedRevenue,
      totalExpenses: calculatedMaterialCost + newCycleTransport + newCycleLabor + newCycleMisc,
      netProfit: calculatedNetProfit,
      investorPayout: 0,
      adminPayout: 0,
      fundingItems: [
        { name: `${calculatedTons} Tons PET Sourced Stock`, amount: calculatedMaterialCost, isEquipment: false },
        { name: "Direct Logistics & Haulage", amount: newCycleTransport, isEquipment: false },
        { name: "Manual Helper & Sorter Day-rate", amount: newCycleLabor, isEquipment: false },
        { name: "Direct Utility Overheads", amount: newCycleMisc, isEquipment: false }
      ],
      investors: initialInvestors,
      expensesList: []
    });

    setIsCreatorSuccess(true);
    setTimeout(() => {
      setIsCreatorSuccess(false);
      setShowCreator(false);
      setNewCycleName("");
      setNewCycleTons("2.5");
      setSeedFunding("full");
      setSeedAmount("");
      setSeedInvestorName("");
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-natural-900">
            Investor Portfolio & Tonnage Campaign
          </h2>
          <p className="text-natural-600 mt-2 text-sm font-bold">
            Real-time transparency on active operations and historic returns.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreator(!showCreator);
          }}
          className={cn(
            "px-5 py-2.5 rounded-full font-serif font-bold text-xs shadow-md transition-all flex items-center gap-2",
            showCreator 
              ? "bg-stone-800 text-white hover:bg-black" 
              : "bg-primary text-white hover:bg-primary-dark"
          )}
        >
          {showCreator ? "× Close Cycle Creator" : "+ Plan Tonnage & Fund Matcher"}
        </button>
      </div>

      {showCreator && (
        <div className="bg-amber-50/40 p-6 md:p-8 rounded-[2.5rem] border border-amber-200 shadow-sm mb-8 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-natural-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" /> Plan New Processing Campaign
              </h3>
              <p className="text-xs text-natural-600 mt-1 font-bold uppercase tracking-wider">
                Create a self-funding operational cycle to processes intended tonnages.
              </p>
            </div>
            <button
              onClick={() => setShowCreator(false)}
              className="text-natural-400 hover:text-natural-600 font-bold text-lg"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleCreateAndFund} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              {/* Campaign Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                    Campaign / Cycle Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Cycle Batch ${calculatedTons}T`}
                    value={newCycleName}
                    onChange={(e) => setNewCycleName(e.target.value)}
                    className="block w-full rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                  />
                  <span className="text-[9px] text-natural-500 font-medium block mt-1">
                    Defaults to auto-generated name if left empty.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                    Intended Tonnage to Process (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.5"
                    max="100.0"
                    value={newCycleTons}
                    onChange={(e) => setNewCycleTons(e.target.value)}
                    className="block w-full rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {["1.5", "2.0", "2.5", "3.0", "5.0"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewCycleTons(t)}
                        className={cn(
                          "px-2 py-1 rounded bg-white text-[9px] font-bold border border-natural-300 shadow-xs hover:bg-natural-50",
                          newCycleTons === t ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50 text-amber-900" : ""
                        )}
                      >
                        {t} Tons
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Cycle Costs breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-natural-200">
                <h4 className="text-xs font-bold text-natural-900/80 uppercase tracking-widest mb-3 pb-2 border-b border-natural-100 flex justify-between items-center">
                  <span>Estimated Execution Expenses</span>
                  <span className="text-[10px] text-primary lowercase tracking-normal">Calculated based on settings rates</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                  {/* Stock Sourcing Cost */}
                  <div className="p-3 bg-natural-50 rounded-xl">
                    <span className="block text-[9px] text-natural-500 uppercase tracking-wide">Stock Material purchase</span>
                    <span className="block text-sm text-natural-900 mt-1">{formatNaira(calculatedMaterialCost)}</span>
                    <span className="block text-[8px] text-natural-400 font-medium">({calculatedKg.toLocaleString()}kg @ ₦{settings.buyPricePerKg}/kg)</span>
                  </div>

                  {/* Logistics Costs */}
                  <div>
                    <label className="block text-[9px] text-natural-700 uppercase tracking-wide mb-1">Logistics / Haulage Fee (₦)</label>
                    <input
                      type="number"
                      value={newCycleTransport}
                      onChange={(e) => setNewCycleTransport(Number(e.target.value) || 0)}
                      className="block w-full rounded-xl border-natural-300 border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-natural-900 bg-white"
                    />
                  </div>

                  {/* Labor Costs */}
                  <div>
                    <label className="block text-[9px] text-natural-700 uppercase tracking-wide mb-1">Labor Sorter day-rate (₦)</label>
                    <input
                      type="number"
                      value={newCycleLabor}
                      onChange={(e) => setNewCycleLabor(Number(e.target.value) || 0)}
                      className="block w-full rounded-xl border-natural-300 border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-natural-900 bg-white"
                    />
                  </div>

                  {/* Misc Operational Reserves */}
                  <div>
                    <label className="block text-[9px] text-natural-700 uppercase tracking-wide mb-1">General Overheads / Misc (₦)</label>
                    <input
                      type="number"
                      value={newCycleMisc}
                      onChange={(e) => setNewCycleMisc(Number(e.target.value) || 0)}
                      className="block w-full rounded-xl border-natural-300 border px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-natural-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Funding / Seeding matcher integration */}
              <div className="bg-white p-5 rounded-2xl border border-natural-200 space-y-4">
                <h4 className="text-xs font-bold text-natural-900/80 uppercase tracking-widest pb-2 border-b border-natural-100 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" /> Match Sourced Capital Right Now
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {[
                    { id: "none", title: "No Initial Funding", desc: "Leaves pool as open campaign requesting external investors." },
                    { id: "partial", title: "Seed Partially", desc: "Contribute custom cash injection on start." },
                    { id: "full", title: "Full Match Mode", desc: "Instantly and fully execute capital match for process start." }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSeedFunding(opt.id as any);
                        if (opt.id === "full") {
                          setSeedAmount(calculatedTotalBudget.toString());
                        } else if (opt.id === "none") {
                          setSeedAmount("0");
                        }
                      }}
                      className={cn(
                        "flex-1 p-3.5 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between",
                        seedFunding === opt.id 
                          ? "bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/10 text-amber-900" 
                          : "bg-natural-50 hover:bg-natural-100/50 border-natural-200 text-natural-700"
                      )}
                    >
                      <span className="block text-xs font-bold text-natural-900">{opt.title}</span>
                      <span className="block text-[9px] text-natural-500 font-medium leading-tight mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                {seedFunding !== "none" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in pt-2">
                    <div>
                      <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1">
                        Sponsor / Investor Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lead Managing Partner"
                        value={seedInvestorName}
                        onChange={(e) => setSeedInvestorName(e.target.value)}
                        className="block w-full rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-natural-700 uppercase tracking-widest mb-1 flex justify-between">
                        <span>Funding Contribution Amount (₦)</span>
                        {seedFunding === "full" && <span className="text-[#4a6741] font-serif">(100% Fully Matched)</span>}
                      </label>
                      <input
                        type="number"
                        disabled={seedFunding === "full"}
                        required
                        max={calculatedTotalBudget}
                        min="1"
                        placeholder="e.g. 1000000"
                        value={seedFunding === "full" ? calculatedTotalBudget : seedAmount}
                        onChange={(e) => setSeedAmount(e.target.value)}
                        className="block w-full rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-disabled"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Metrics & Launch Sidebar */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between space-y-6">
              <div className="bg-stone-900 text-white rounded-[2rem] p-6 space-y-5 shadow-inner">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Live Campaign Forecast</span>
                  <h4 className="text-xl font-serif font-bold text-stone-100 mt-1">{newCycleName || `Tonnage Batch ${calculatedTons}T`}</h4>
                </div>

                <div className="space-y-3.5 divide-y divide-white/15 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-medium">Processing Tonnage</span>
                    <span className="font-bold text-stone-200">{calculatedTons.toLocaleString()} Metric Tons ({calculatedKg.toLocaleString()} kg)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3.5">
                    <span className="text-stone-400 font-medium">Forecasted Turnover / Selling Revenue</span>
                    <span className="font-bold text-stone-200 font-mono">{formatNaira(calculatedRevenue)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-3.5">
                    <span className="text-stone-400 font-medium">Process Execution Budget</span>
                    <span className="font-bold text-amber-400 font-mono">{formatNaira(calculatedTotalBudget)}</span>
                  </div>

                  <div className="flex justify-between pt-3.5">
                    <div>
                      <span className="block text-xs text-stone-400 font-medium">Net Return (Shared ROI Portion)</span>
                      <span className="text-[10px] text-stone-500 font-bold block">(ROI: {(((calculatedRevenue - calculatedTotalBudget) / (calculatedTotalBudget || 1)) * 100).toFixed(1)}%)</span>
                    </div>
                    <span className="font-bold text-green-400 text-sm font-mono self-center">+{formatNaira(calculatedRevenue - calculatedTotalBudget)}</span>
                  </div>

                  <div className="flex justify-between pt-3.5">
                    <span className="text-xs text-stone-400 font-medium self-center">Matched Initial Funds</span>
                    <span className="font-bold text-blue-400 font-mono text-sm self-center">
                      {seedFunding === "full" 
                        ? formatNaira(calculatedTotalBudget) 
                        : seedFunding === "partial" 
                          ? formatNaira(Number(seedAmount) || 0) 
                          : formatNaira(0)}
                    </span>
                  </div>
                </div>

                {seedFunding && seedFunding !== "none" && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] leading-relaxed text-stone-300">
                    <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-widest mb-1">Instant Verification Matcher</span>
                    The matched funding of <strong className="text-white font-mono">{seedFunding === "full" ? formatNaira(calculatedTotalBudget) : formatNaira(Number(seedAmount) || 0)}</strong> has been directly approved, logged into the treasury ledger system, and allocated specifically to execute the sourcing campaign of <strong className="text-white">{calculatedTons} Tons</strong>.
                  </div>
                )}
              </div>

              <div>
                {isCreatorSuccess ? (
                  <div className="p-4 bg-emerald-500 text-white rounded-2xl text-center font-bold text-xs shadow">
                    ✓ Sourcing Tonnage Cycle launched and funds matched successfully!
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-serif font-bold text-sm py-3.5 rounded-full transition shadow-md"
                  >
                    🚀 Launch Campaign & Allocate Funds
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-natural-200 rounded-lg text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest">
              Total Capital Deployed
            </span>
          </div>
          <span className="text-3xl font-serif font-bold text-natural-800">
            {formatNaira(portfolio.totalInvested)}
          </span>
        </div>

        <div className="bg-primary p-6 rounded-[2rem] shadow-sm flex flex-col justify-between text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-dark rounded-lg text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] md:text-xs opacity-80 font-bold uppercase tracking-widest">
              Total Returns Earned
            </span>
          </div>
          <span className="text-3xl font-serif font-bold">
            {formatNaira(portfolio.totalReturned)}
          </span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm mb-8">
          <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-6">
            Investment Lifecycle & ROI Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `\u20A6${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: '#737373' }}
                />
                <Tooltip 
                   formatter={(value: number) => formatNaira(value)}
                   labelStyle={{ color: '#171717', fontWeight: 'bold', marginBottom: '8px' }}
                   contentStyle={{ borderRadius: '1rem', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Capital Deployed" stroke="#171717" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Returns Earned" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Projected Returns" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary">
          Active Opportunities & Cycles
        </h3>
        
        {activeCycles.length === 0 ? (
           <div className="p-8 text-center text-natural-600 italic bg-white rounded-[2rem] border border-natural-300">
             No active cycles currently requesting funds.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCycles.map(cycle => {
              const cycleBuy = cycle.buyPricePerKg || settings.buyPricePerKg;
              const cycleSell = cycle.sellPricePerKg || settings.sellPricePerKg;
              const cycleKg = cycle.totalKgCollected || 2000;
              const cycleTransport = cycle.expenses?.transportCost || 250000;
              const cycleMisc = cycle.expenses?.miscCost || 0;
              const cycleRevenue = cycle.expectedPayment || (cycleKg * cycleSell);
              const cycleRunningCapital = (cycleKg * cycleBuy) + cycleTransport + cycleMisc;
              // CAPEX is not deducted from revenue, net profit is revenue minus running cost (including added/misc cost during cycle)
              const expectedReturn = Math.max(0, (cycleRevenue - cycleRunningCapital) * settings.investorSharePercent);

              // Parse capital and real-time live balance
              const additionalExpenses = (cycle.expensesList || []).reduce((sum, item) => sum + item.amount, 0);
              const totalApproved = (cycle.investors || []).filter(i => i.approved).reduce((sum, i) => sum + i.amount, 0);
              
              const isPlatDeducted = cycle.status !== "awaiting_funds" && cycle.status !== "collation";
              const platPurchase = cycle.expenses.plasticPurchaseCost || (cycle.totalKgCollected * cycle.buyPricePerKg);
              const actPlatCost = isPlatDeducted ? platPurchase : 0;

              const isTranspCompleted = cycle.status === "payment_awaited" || cycle.status === "completed";
              const actTransCost = isTranspCompleted ? cycle.expenses.transportCost : 0;
              const actLabCost = isTranspCompleted ? cycle.expenses.laborCost : 0;

              const isEqDeducted = cycle.status === "completed";
              const actEqCost = isEqDeducted ? cycle.expenses.equipmentCostAllocated : 0;

              const isRevAdded = cycle.status === "completed";
              const actRev = isRevAdded ? cycle.revenue : 0;

              const currentLiveBalance = totalApproved - additionalExpenses - actPlatCost - actTransCost - actLabCost - actEqCost + actRev;

              return (
                <div 
                  key={cycle.id}
                  onClick={() => handleCycleSelect(cycle)}
                  className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm hover:shadow-md hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                         <h4 className="font-serif font-bold text-lg text-natural-900">{cycle.name}</h4>
                         <p className="text-xs text-natural-600 mt-1">{new Date(cycle.date).toLocaleDateString()}</p>
                       </div>
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                          {cycle.status.replace("_", " ")}
                       </span>
                    </div>

                    {/* Funding Progress or Live Cash Balance widget */}
                    {cycle.status === "awaiting_funds" ? (
                      <div className="mb-4 bg-primary/5 rounded-2xl p-4 border border-primary/10">
                        <div className="flex justify-between text-[10px] font-bold text-natural-600 mb-1">
                          <span>Sourced Capital</span>
                          <span className="font-mono">{formatNaira(totalApproved)} / {formatNaira(cycle.targetFundNeeded)}</span>
                        </div>
                        <div className="w-full bg-natural-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, (totalApproved / (cycle.targetFundNeeded || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 bg-natural-50 rounded-2xl p-4 border border-natural-200">
                        <div className="text-[10px] font-bold text-natural-600 uppercase tracking-widest mb-1">
                          Live Active Cash Balance
                        </div>
                        <div className="text-lg font-bold text-natural-800 font-mono">
                          {formatNaira(currentLiveBalance)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-natural-600 mb-1">Total Target Pool</div>
                      <div className="text-xl font-bold text-natural-900">{formatNaira(cycle.targetFundNeeded)}</div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                       <div>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-natural-600 mb-1">Estimated Return</div>
                         <div className="text-lg font-bold text-primary">+{formatNaira(expectedReturn)}</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-natural-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedCycle && (() => {
        const modalTotalApproved = (selectedCycle.investors || []).filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0);
        const modalCapacityLeft = Math.max(0, selectedCycle.targetFundNeeded - modalTotalApproved);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-900/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 pb-4 border-b border-natural-200 flex justify-between items-center bg-natural-50">
                <div>
                  <h3 className="text-xl font-serif font-bold text-natural-900">
                    Call for Investment
                  </h3>
                  <p className="text-xs text-natural-600 mt-1 uppercase tracking-widest font-bold">
                    {selectedCycle.name}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-natural-200 rounded-full transition-colors text-natural-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {!paymentStage ? (
                  <>
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                        Total Fund Amount Needed
                      </div>
                      <div className="text-3xl font-serif font-bold text-primary">
                        {formatNaira(selectedCycle.targetFundNeeded)}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Allocation of Funds
                      </h4>
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {selectedCycle.fundingItems && selectedCycle.fundingItems.length > 0 ? (
                          selectedCycle.fundingItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-natural-50 rounded-xl border border-natural-200">
                              <div>
                                <div className="text-xs font-bold text-natural-900 flex items-center gap-2">
                                  {item.name}
                                  {item.isEquipment && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      Equipment
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-natural-500 font-medium mt-0.5">
                                  {item.isEquipment ? "Capex - long term value" : "Direct cycle operations"}
                                </div>
                              </div>
                              <div className="text-xs font-bold text-natural-800 font-mono">
                                {formatNaira(item.amount)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between items-center p-3 sm:p-4 bg-natural-50 rounded-xl border border-natural-200">
                              <div>
                                <div className="text-sm font-bold text-natural-900">Running Capital</div>
                                <div className="text-xs text-natural-600">Material purchase, transport, labor</div>
                              </div>
                              <div className="text-base font-bold text-natural-800">
                                {formatNaira(selectedCycle.targetFundNeeded * 0.85)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 sm:p-4 bg-natural-50 rounded-xl border border-natural-200">
                              <div>
                                <div className="text-sm font-bold text-natural-900">Infrastructure & Ops</div>
                                <div className="text-xs text-natural-600">Equipment depreciation & maintenance</div>
                              </div>
                              <div className="text-base font-bold text-natural-800">
                                {formatNaira(selectedCycle.targetFundNeeded * 0.15)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3 flex items-center gap-2">
                        <Coins className="w-4 h-4" /> Simulate Investment
                      </h4>
                      
                      {modalCapacityLeft <= 0 ? (
                        <div className="p-5 bg-amber-50 border border-amber-200 rounded-[2rem] text-amber-800 text-xs font-bold leading-relaxed space-y-2 flex flex-col items-center text-center">
                          <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                          <div>
                            <p className="uppercase tracking-wider text-[10px] text-amber-600 mb-1">Round Fully Funded</p>
                            <p>This operational cycle is already 100% funded with approved capital contributions. No further investments are being accepted for this campaign.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-natural-50 p-4 rounded-xl border border-natural-200 space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5 flex justify-between">
                              <span>Investment Amount (₦)</span>
                              <span className="text-amber-600 font-bold shrink-0">
                                Capacity Left: {formatNaira(modalCapacityLeft)} ({((modalCapacityLeft / selectedCycle.targetFundNeeded) * 100).toFixed(1)}%)
                              </span>
                            </label>
                            <input
                              type="number"
                              value={investmentAmount}
                              onChange={(e) => setInvestmentAmount(e.target.value)}
                              min={Math.min(selectedCycle.targetFundNeeded * settings.minInvestmentPercent, modalCapacityLeft)}
                              max={modalCapacityLeft}
                              className="block w-full rounded-xl border-natural-300 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                            />
                            <div className="mt-2.5">
                              <span className="block text-[9px] font-bold text-natural-500 uppercase tracking-widest mb-1">
                                Quick Select Share of Remaining Needed Funds
                              </span>
                              <div className="grid grid-cols-4 gap-2">
                                {[0.25, 0.50, 0.75, 1.00].map((pct) => {
                                  const amount = Math.round(modalCapacityLeft * pct);
                                  const isSelected = Math.round(Number(investmentAmount)) === amount;
                                  return (
                                    <button
                                      key={pct}
                                      type="button"
                                      onClick={() => setInvestmentAmount(amount.toString())}
                                      className={cn(
                                        "px-2 py-1.5 rounded-lg text-xs font-serif font-bold border transition text-center shadow-xs",
                                        isSelected
                                          ? "bg-primary border-primary text-white"
                                          : "bg-white border-natural-300 text-natural-800 hover:bg-natural-100"
                                      )}
                                    >
                                      {pct * 100}% of Left
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const selBuy = selectedCycle.buyPricePerKg || settings.buyPricePerKg;
                            const selSell = selectedCycle.sellPricePerKg || settings.sellPricePerKg;
                            const selKg = selectedCycle.totalKgCollected || 2000;
                            const selTransport = selectedCycle.expenses?.transportCost || 250000;
                            const selMisc = selectedCycle.expenses?.miscCost || 0;
                            const selRevenue = selectedCycle.expectedPayment || (selKg * selSell);
                            const selRunningCapital = (selKg * selBuy) + selTransport + selMisc;
                            const selExpectedReturn = Math.max(0, (selRevenue - selRunningCapital) * settings.investorSharePercent);
                            
                            const simulatedEstimatedReturn = selectedCycle.targetFundNeeded > 0
                              ? Number(investmentAmount) * (selExpectedReturn / selectedCycle.targetFundNeeded)
                              : 0;

                            return (
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-natural-200">
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest font-bold text-natural-500 mb-1">Fund Share</div>
                                  <div className="text-sm font-bold text-natural-800">
                                    {selectedCycle.targetFundNeeded > 0 
                                      ? ((Number(investmentAmount) / selectedCycle.targetFundNeeded) * 100).toFixed(2) 
                                      : "0"}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest font-bold text-natural-500 mb-1">Projected Return</div>
                                  <div className="text-sm font-bold text-green-600">
                                    +{formatNaira(simulatedEstimatedReturn)}
                                  </div>
                                  <div className="text-[9px] text-natural-500 font-medium">
                                    (ROI calculated strictly on working cap portion)
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3 flex items-center gap-2">
                        <ScrollText className="w-4 h-4" /> Agreed Terms
                      </h4>
                      <div className="bg-natural-50 p-4 sm:p-5 rounded-2xl border border-natural-200">
                        <p className="text-xs text-natural-700 whitespace-pre-wrap leading-relaxed font-medium">
                          {settings.investmentTerms || "Standard Terms:\n1. 12-Month Lock-in Period for principal investment.\n2. Option for buyout (Principal + Profit payout) or conversion to Business Equity proportional to investment share.\n3. Return on Investment is paid out periodically as cycles are completed."}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                        Amount to Transfer
                      </div>
                      <div className="text-3xl font-serif font-bold text-primary">
                        {formatNaira(Number(investmentAmount))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3">Bank Details</h4>
                      <div className="bg-natural-50 p-4 sm:p-6 rounded-2xl border border-natural-200 space-y-4">
                         <div>
                           <div className="text-[10px] uppercase tracking-widest font-bold text-natural-500 mb-1">Bank Name</div>
                           <div className="text-base font-bold text-natural-900">KUDA</div>
                         </div>
                         <hr className="border-natural-200" />
                         <div>
                           <div className="text-[10px] uppercase tracking-widest font-bold text-natural-500 mb-1">Account Number</div>
                           <div className="text-xl font-bold tracking-widest text-natural-900">3002625918</div>
                         </div>
                         <hr className="border-natural-200" />
                         <div>
                           <div className="text-[10px] uppercase tracking-widest font-bold text-natural-500 mb-1">Account Name</div>
                           <div className="text-base font-bold text-natural-900">Tintville Nigerian Enterprise</div>
                         </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3">Your Name / Business Name</h4>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kolawole Davies"
                        value={investorName}
                        onChange={(e) => setInvestorName(e.target.value)}
                        className="block w-full rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3">Upload Payment Proof</h4>
                      <div className="border-2 border-dashed border-natural-300 rounded-xl p-6 text-center hover:bg-natural-50 transition cursor-pointer">
                        <p className="text-xs text-natural-600 font-bold">Click to browse or drag receipt here</p>
                      </div>
                    </div>

                    <a 
                      href={`https://wa.me/2348038744441?text=Hi!%20I%20have%20just%20invested%20${formatNaira(Number(investmentAmount))}%20for%20${encodeURIComponent(selectedCycle.name)}.`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex justify-center items-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-full font-bold hover:bg-[#20b858] transition text-sm shadow-md"
                    >
                      Share Proof to CEO WhatsApp
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-natural-200 bg-natural-50">
                {!paymentStage ? (
                  <button
                    onClick={() => setPaymentStage(true)}
                    disabled={
                      modalCapacityLeft <= 0 ||
                      Number(investmentAmount) <= 0 ||
                      Number(investmentAmount) > modalCapacityLeft ||
                      Number(investmentAmount) < Math.min(selectedCycle.targetFundNeeded * settings.minInvestmentPercent, modalCapacityLeft)
                    }
                    className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary-dark transition text-sm shadow-md disabled:bg-natural-400"
                  >
                    Lock In Investment
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!investorName.trim()) {
                        alert("Please indicate your name or business name so we can verify the payment.");
                        return;
                      }

                      // Dynamic final checking
                      const curTotal = (selectedCycle.investors || []).filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0);
                      const curLeft = Math.max(0, selectedCycle.targetFundNeeded - curTotal);
                      const finalAmt = Number(investmentAmount);

                      if (curLeft <= 0) {
                        alert("This operational cycle is already 100% funded! No more investments allowed.");
                        closeModal();
                        return;
                      }

                      if (finalAmt > curLeft) {
                        alert(`Only ₦${curLeft.toLocaleString()} remains under this campaign. Your investment has been automatically adjusted to this maximum allowed contribution.`);
                      }

                      const amtToSave = Math.min(finalAmt, curLeft);

                      const newCommitment = {
                        id: Date.now().toString() + Math.random().toString(),
                        name: investorName.trim(),
                        amount: amtToSave,
                        approved: false,
                        date: new Date().toISOString()
                      };

                      const existing = selectedCycle.investors || [];
                      updateCycle(selectedCycle.id, {
                        investors: [...existing, newCommitment]
                      });

                      alert("Your interest and payment proof has been sent to the Admin verification queue. Thank you!");
                      setInvestorName("");
                      closeModal();
                    }}
                    className="w-full bg-natural-900 text-white py-3 rounded-full font-bold hover:bg-black transition text-sm shadow-md"
                  >
                    I have made the transfer
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

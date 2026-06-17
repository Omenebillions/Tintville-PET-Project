import React, { useState, useMemo } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira } from "../lib/utils";
import {
  TrendingUp,
  Coins,
  DollarSign,
  PiggyBank,
  Briefcase,
  Percent,
  Layers,
  ArrowUpRight,
  Boxes,
  Activity,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminFinances() {
  const { cycles, settings, role } = useAppContext();
  const [scaleTargetTons, setScaleTargetTons] = useState<number>(10);
  const [targetMarginMarkup, setTargetMarginMarkup] = useState<number>(75); // e.g. 75% markup

  if (role !== "admin") {
    return (
      <div className="p-8 text-center bg-white rounded-[2.5rem] border border-natural-300 max-w-lg mx-auto mt-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#cf5858] mb-2">
          Access Denied
        </h3>
        <p className="text-natural-600 text-xs font-bold leading-relaxed">
          The Corporate Finances planning board is confidential and restricted to authorized corporate admins only.
        </p>
      </div>
    );
  }

  // Filter out soft-deleted cycles
  const activeCycles = cycles.filter((c) => !c.isDeleted && c.status !== "completed");
  const completedCycles = cycles.filter((c) => !c.isDeleted && c.status === "completed");

  const [useHistoricalRates, setUseHistoricalRates] = useState<boolean>(false);

  // Sum total administrative share of profits (Confidential retainment reserves)
  const corporateRetainedEarnings = useMemo(() => {
    return completedCycles.reduce((sum, c) => sum + (c.adminPayout || 0), 0);
  }, [completedCycles]);

  // Projected administrative payout from active cycles
  const pipelineRetainedProjected = useMemo(() => {
    return activeCycles.reduce((sum, c) => sum + (c.adminPayout || 0), 0);
  }, [activeCycles]);

  const totalRawCostVolume = useMemo(() => {
    // Sum opex across completed cycles
    return completedCycles.reduce((sum, c) => {
      const plasticCost = c.expenses.plasticPurchaseCost || (c.totalKgCollected * (c.buyPricePerKg || 300));
      const transportCost = c.expenses.transportCost || 0;
      const miscCost = c.expenses.miscCost || 0;
      const laborCost = c.expenses.laborCost || 0;
      return sum + plasticCost + transportCost + laborCost + miscCost;
    }, 0);
  }, [completedCycles]);

  const totalTurnover = useMemo(() => {
    return completedCycles.reduce((sum, c) => sum + (c.revenue || 0), 0);
  }, [completedCycles]);

  // Pipeline metrics
  const pipelineTurnoverProjected = useMemo(() => {
    return activeCycles.reduce((sum, c) => sum + (c.revenue || 0), 0);
  }, [activeCycles]);

  const pipelineRawCostProjected = useMemo(() => {
    return activeCycles.reduce((sum, c) => {
      const plasticCost = c.expenses.plasticPurchaseCost || (c.totalKgCollected * (c.buyPricePerKg || 300));
      const transportCost = c.expenses.transportCost || 0;
      const miscCost = c.expenses.miscCost || 0;
      const laborCost = c.expenses.laborCost || 0;
      return sum + plasticCost + transportCost + laborCost + miscCost;
    }, 0);
  }, [activeCycles]);

  // Historical average rate metrics
  const historicalAverages = useMemo(() => {
    if (completedCycles.length === 0) {
      return {
        buyPrice: settings.buyPricePerKg,
        sellPrice: settings.sellPricePerKg,
        opexPerTon: 16500, // Fallback default operating cost per ton
        hasHistorical: false,
      };
    }
    const totalBuy = completedCycles.reduce((sum, c) => sum + (c.buyPricePerKg || 300), 0);
    const totalSell = completedCycles.reduce((sum, c) => sum + (c.sellPricePerKg || 510), 0);
    
    // Average opex per ton
    const completedTons = completedCycles.reduce((sum, c) => sum + (c.totalKgCollected || 0), 0) / 1000;
    const completedOpex = completedCycles.reduce((sum, c) => {
      const transport = c.expenses.transportCost || 0;
      const labor = c.expenses.laborCost || 0;
      const misc = c.expenses.miscCost || 0;
      return sum + transport + labor + misc;
    }, 0);
    const opexPerTon = completedTons > 0 ? completedOpex / completedTons : 16500;

    return {
      buyPrice: Math.round(totalBuy / completedCycles.length),
      sellPrice: Math.round(totalSell / completedCycles.length),
      opexPerTon: Math.round(opexPerTon),
      hasHistorical: true,
    };
  }, [completedCycles, settings]);

  const activeBuyPrice = useHistoricalRates && historicalAverages.hasHistorical 
    ? historicalAverages.buyPrice 
    : settings.buyPricePerKg;

  // Equity Distribution Model Data
  const equityData = [
    { name: "Founders & Management", value: 65, color: "#4A6741" },
    { name: "Angel / Early Backers", value: 15, color: "#828D7A" },
    { name: "Public Pools / Future Rounds", value: 20, color: "#CBD1B4" },
  ];

  // Plant Overhead Fixed Assets Valuation Model
  const fixedAssets = [
    { name: "HD Industrial Shredder / Granulator", value: 1200000, qty: 1, ageMonths: 14 },
    { name: "Baling Compressor (Hydraulic)", value: 850000, qty: 1, ageMonths: 8 },
    { name: "Platform Sorting Belts & Air Classifiers", value: 450000, qty: 2, ageMonths: 18 },
    { name: "Transit Logistics Truck (Pre-owned Flatbed)", value: 3400000, qty: 1, ageMonths: 24 },
  ];

  const totalFixedAssetValue = fixedAssets.reduce((sum, item) => sum + item.value * item.qty, 0);

  // Compute Growth projection variables
  const scaleMaterialCost = scaleTargetTons * 1000 * activeBuyPrice;
  const scaleSellPrice = useHistoricalRates && historicalAverages.hasHistorical
    ? historicalAverages.sellPrice
    : activeBuyPrice * (1 + targetMarginMarkup / 100);
  const scaleProjectedRevenue = scaleTargetTons * 1000 * scaleSellPrice;

  // Typical active operational costs (logistics & manual helper cost) at scale (or historical opex per ton)
  const scaleOperatingCosts = useHistoricalRates && historicalAverages.hasHistorical
    ? scaleTargetTons * historicalAverages.opexPerTon
    : scaleTargetTons * 12000 + 45000;
  
  const scaleTotalExpenses = scaleMaterialCost + scaleOperatingCosts;
  const scaleProjectedNetProfit = scaleProjectedRevenue - scaleTotalExpenses;

  // Split projection according to investor share configuration
  const scaleProjectedInvestorPayout = scaleProjectedNetProfit > 0 ? scaleProjectedNetProfit * settings.investorSharePercent : 0;
  const scaleProjectedCorporateShare = scaleProjectedNetProfit > 0 ? scaleProjectedNetProfit * (1 - settings.investorSharePercent) : scaleProjectedNetProfit;

  // Format Recharts data for Completed Cycles
  const chartData = useMemo(() => {
    return completedCycles.map((c) => {
      const plasticCost = c.expenses.plasticPurchaseCost || (c.totalKgCollected * (c.buyPricePerKg || 300));
      const transportCost = c.expenses.transportCost || 0;
      const miscCost = c.expenses.miscCost || 0;
      const laborCost = c.expenses.laborCost || 0;
      const opCosts = plasticCost + transportCost + laborCost + miscCost;
      return {
        name: c.name || `Cycle ${new Date(c.date).toLocaleDateString()}`,
        revenue: c.revenue || 0,
        opex: opCosts,
        retained: c.adminPayout || 0,
      };
    });
  }, [completedCycles]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section with badge */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Confidential Admin Board
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-natural-900">
            Corporate Finances & Capital Expansion
          </h2>
          <p className="text-[10px] sm:text-xs text-natural-600 font-bold uppercase tracking-widest mt-1">
            Structural capital, administrative performance ratios, and strategic growth planner.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-10 px-4 bg-natural-100 border border-natural-300 rounded-full flex items-center gap-2 text-xs font-bold text-natural-700">
            <Calendar className="w-4 h-4 text-primary" /> Q2 FY26 Runway
          </div>
        </div>
      </div>

      {/* Main Grid: General Standing Statistics & Corporate reserves */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Retained Corporate Reserves */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-natural-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[9px] text-natural-600 font-bold uppercase tracking-widest">
                Retained Corporate Share
              </span>
              <span className="block text-[11px] text-natural-500 font-bold uppercase mt-0.5">
                Admin's Total Retained Profit
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="block font-serif font-bold text-2xl md:text-3xl text-natural-900 leading-none">
              {formatNaira(corporateRetainedEarnings)}
            </span>
            <span className="block text-[10px] text-primary font-bold uppercase mt-1">
              • Secured Actuals (Completed)
            </span>
            {pipelineRetainedProjected > 0 && (
              <span className="block text-[11px] text-natural-500 font-semibold mt-1">
                + {formatNaira(pipelineRetainedProjected)} pipeline (open cycles)
              </span>
            )}
          </div>
          <p className="text-[10px] text-natural-500 font-bold uppercase mt-3 pt-2 border-t border-natural-100">
            Realized cash reserves from completed cycle profit shares.
          </p>
        </div>

        {/* System Asset Valuation */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-natural-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[9px] text-natural-600 font-bold uppercase tracking-widest">
                Capitalized Plant Assets
              </span>
              <span className="block text-[11px] text-natural-500 font-bold uppercase mt-0.5">
                Industrial CapEx Valuation
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="block font-serif font-bold text-2xl md:text-3xl text-natural-900 leading-none">
              {formatNaira(totalFixedAssetValue)}
            </span>
            <span className="block text-[10px] text-amber-600 font-bold uppercase mt-1">
              • Book Value Backed
            </span>
            <span className="block text-[11px] text-natural-500 font-semibold mt-1">
              ₦50,000 depreciation reserve
            </span>
          </div>
          <p className="text-[10px] text-natural-500 font-bold uppercase mt-3 pt-2 border-t border-natural-100">
            Valuation of shredders, sorting lines, and flatbeds.
          </p>
        </div>

        {/* Corporate Operating Margin Ratio */}
        <div className="bg-primary p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[9px] opacity-70 font-bold uppercase tracking-widest">
                Operating Profit Margin
              </span>
              <span className="block text-[11px] opacity-80 font-bold uppercase mt-0.5">
                Operational ROI Efficiency
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="block font-serif font-bold text-2xl md:text-3xl leading-none">
              {totalTurnover > 0
                ? `${(((totalTurnover - totalRawCostVolume) / totalTurnover) * 100).toFixed(1)}%`
                : "76.7%"}
            </span>
            <span className="block text-[10px] opacity-80 font-bold uppercase mt-1">
              • {totalTurnover > 0 ? "Actual Historical Margin" : "Projected Target Margin"}
            </span>
            {totalTurnover > 0 && (
              <span className="block text-[11px] opacity-70 font-semibold mt-1">
                Target: {(((settings.sellPricePerKg - settings.buyPricePerKg) / settings.sellPricePerKg) * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-[10px] opacity-70 font-bold uppercase mt-3 pt-2 border-t border-white/10">
            Average margin on processed weight before investor distributions.
          </p>
        </div>
      </div>

      {/* Structural Equity Breakdown & Fixed Asset Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Breakdown chart */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Shareholding & Corporate Capital Structure
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={equityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {equityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-serif text-center pointer-events-none">
                <span className="text-2xl font-bold text-natural-900">100%</span>
                <span className="text-[8px] font-bold text-natural-500 uppercase tracking-wider">
                  Total Equity
                </span>
              </div>
            </div>

            <div className="space-y-4 w-full">
              {equityData.map((eq, index) => (
                <div key={index} className="p-3 bg-natural-50 border border-natural-200 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: eq.color }}
                      />
                      <span className="text-xs font-bold text-natural-800">{eq.name}</span>
                    </div>
                    <span className="text-xs font-bold text-natural-900 font-mono">
                      {eq.value}% Share
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Capex / Fixed Asset Register */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Capital Fixed Asset Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead>
                  <tr className="border-b border-natural-200 text-natural-600 font-bold uppercase text-[9px] tracking-wider">
                    <th className="pb-2">Asset Item</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Age</th>
                    <th className="pb-2 text-right">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100 font-medium text-natural-700">
                  {fixedAssets.map((asset, idx) => (
                    <tr key={idx} className="hover:bg-natural-50">
                      <td className="py-2.5 font-bold text-natural-800">{asset.name}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-natural-600">
                        {asset.qty}
                      </td>
                      <td className="py-2.5 text-right font-mono text-natural-500">
                        {asset.ageMonths}m
                      </td>
                      <td className="py-2.5 text-right font-bold font-mono text-natural-900">
                        {formatNaira(asset.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-4 border-t border-natural-200 flex justify-between items-center text-xs font-bold mt-4">
            <span className="text-natural-600 uppercase tracking-wider text-[9px]">
              Total Operational Backing Book Value
            </span>
            <span className="text-sm font-serif font-bold text-primary">
              {formatNaira(totalFixedAssetValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Actual Corporate Earnings & Operational Cashflow Block */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4a6741]" /> Actual Corporate Performance & Historical Cashflow
            </h3>
            <p className="text-xs text-natural-500 font-bold uppercase tracking-wider mt-1.5">
              Secure ledger and asset trends verified across fully completed cycles.
            </p>
          </div>
        </div>

        {completedCycles.length === 0 ? (
          <div className="p-10 text-center bg-natural-50 rounded-[2rem] border border-natural-200 flex flex-col items-center justify-center">
            <p className="text-sm text-natural-700 font-bold max-w-md">
              No completed operational cycles detected.
            </p>
            <p className="text-xs text-natural-500 mt-2 font-bold uppercase tracking-wider max-w-lg leading-relaxed">
              When cycles are completed, real cash ledger entries (Revenues, OpEx, and Secured Admin Earnings) will dynamically map onto this panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Recharts Bar Chart illustrating revenues, opex, and net retained admin share */}
            <div className="lg:col-span-7 h-64 relative min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f2" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#78716c", fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#78716c", fontWeight: "bold" }} tickFormatter={(val) => `₦${val / 1000}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatNaira(Number(value)), ""]} 
                    contentStyle={{ borderRadius: "1rem", borderColor: "#e7e5e4" }}
                  />
                  <Bar dataKey="revenue" fill="#4A6741" name="Actual Revenue Received" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opex" fill="#cf5858" name="Actual OpEx Cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retained" fill="#3b82f6" name="Secured Retained Profits" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold uppercase tracking-wider text-natural-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#4A6741] rounded-sm" /> Revenue
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#cf5858] rounded-sm" /> OpEx (Costs)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm" /> Corporate Retained
                </div>
              </div>
            </div>

            {/* Micro List ledger cards of all completed cycles */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-3 max-h-64 overflow-y-auto pr-2">
              {completedCycles.map((c, i) => {
                const plasticCost = c.expenses.plasticPurchaseCost || (c.totalKgCollected * (c.buyPricePerKg || 300));
                const transportCost = c.expenses.transportCost || 0;
                const miscCost = c.expenses.miscCost || 0;
                const laborCost = c.expenses.laborCost || 0;
                const opCosts = plasticCost + transportCost + laborCost + miscCost;
                return (
                  <div key={c.id || i} className="p-3 bg-natural-50 hover:bg-natural-100/50 border border-natural-200 transition-all rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-natural-800">{c.name}</span>
                      <span className="font-mono text-[9px] font-bold text-[#4a6741] bg-[#4a6741]/5 px-2 py-0.5 rounded border border-[#4a6741]/10">
                        {c.totalKgCollected.toLocaleString()} kg PET Sourced
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-natural-500 text-center border-t border-natural-200/40">
                      <div className="text-left">
                        <span className="block text-[8px] opacity-75">Revenue</span>
                        <span className="font-mono text-natural-900 font-bold block mt-0.5">{formatNaira(c.revenue)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] opacity-75">OpEx Cost</span>
                        <span className="font-mono text-red-700 font-bold block mt-0.5">{formatNaira(opCosts)}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] opacity-75">Net Profit</span>
                        <span className="font-mono text-primary font-bold block mt-0.5">{formatNaira(c.netProfit)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] opacity-75">Admin Payout</span>
                        <span className="font-mono text-blue-700 font-bold block mt-0.5">{formatNaira(c.adminPayout)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Segment: Strategic Scaling Planner Simulator */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            Confidential "What-If" Expansion Simulator
          </h3>
        </div>
        <p className="text-xs text-natural-600 leading-relaxed mb-6 font-bold max-w-2xl">
          Simulate scaling target PET recycling capacity to identify financial requirements, projected margins, investor payout burdens, and retained admin profits. Adjust parameters below to calculate theoretical runways.
        </p>

        {historicalAverages.hasHistorical && (
          <div className="mb-6 flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 max-w-xl">
            <input
              id="use-historical-rates"
              type="checkbox"
              checked={useHistoricalRates}
              onChange={(e) => setUseHistoricalRates(e.target.checked)}
              className="accent-primary rounded text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer shrink-0"
            />
            <div>
              <label htmlFor="use-historical-rates" className="text-xs font-bold text-natural-900 cursor-pointer block">
                Use actual historical rates from completed cycles
              </label>
              <span className="text-[10px] text-natural-500 font-bold block mt-0.5 uppercase tracking-wider">
                Buy: ₦{historicalAverages.buyPrice}/kg • Sell: ₦{historicalAverages.sellPrice}/kg • OpEx: ₦{historicalAverages.opexPerTon.toLocaleString()}/ton
              </span>
            </div>
          </div>
        )}

        {/* Sliders Input Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-natural-100 rounded-[2rem] border border-natural-200">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-natural-800 uppercase tracking-widest">
                Recycling Target Volume (Tons)
              </label>
              <div className="px-3 py-1 bg-white border border-natural-300 rounded-lg text-sm font-bold font-mono text-primary">
                {scaleTargetTons.toLocaleString()} Tons
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={scaleTargetTons}
              onChange={(e) => setScaleTargetTons(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-natural-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-natural-500 font-bold uppercase mt-1">
              <span>1 Ton</span>
              <span>25 Tons</span>
              <span>50 Tons Max</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-natural-800 uppercase tracking-widest">
                Target Sell Margin Markup (%)
              </label>
              <div className="px-3 py-1 bg-white border border-natural-300 rounded-lg text-sm font-bold font-mono text-primary">
                {targetMarginMarkup}% Markup
              </div>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="5"
              value={targetMarginMarkup}
              onChange={(e) => setTargetMarginMarkup(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-natural-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-natural-500 font-bold uppercase mt-1">
              <span>30% Markup (Low)</span>
              <span>90% Markup</span>
              <span>150% Markup (Premium)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Spreadsheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sourced Capital Requirement */}
          <div className="p-5 bg-natural-50 border border-natural-300 rounded-2xl shadow-xs">
            <span className="block text-[9px] text-natural-600 font-bold uppercase tracking-widest">
              Required Sourced Capital
            </span>
            <div className="text-2xl font-serif font-bold text-natural-900 mt-2">
              {formatNaira(scaleTotalExpenses)}
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-natural-600 font-bold">
              <div className="flex justify-between">
                <span>Raw PET Purchase:</span>
                <span className="font-mono text-natural-800">{formatNaira(scaleMaterialCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Logistics & Helpers:</span>
                <span className="font-mono text-natural-800">{formatNaira(scaleOperatingCosts)}</span>
              </div>
            </div>
          </div>

          {/* Revenue & Gross Profit */}
          <div className="p-5 bg-natural-50 border border-natural-300 rounded-2xl shadow-xs">
            <span className="block text-[9px] text-natural-600 font-bold uppercase tracking-widest">
              Projected Gross Revenue
            </span>
            <div className="text-2xl font-serif font-bold text-primary mt-2">
              {formatNaira(scaleProjectedRevenue)}
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-natural-600 font-bold">
              <div className="flex justify-between">
                <span>Estimated Profit:</span>
                <span className="text-primary font-mono">{formatNaira(scaleProjectedNetProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Sell Tag:</span>
                <span className="font-mono text-natural-800">₦{scaleSellPrice.toFixed(0)}/kg</span>
              </div>
            </div>
          </div>

          {/* Theoretical Distribution Share */}
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl shadow-xs">
            <span className="block text-[9px] text-primary font-bold uppercase tracking-widest">
              Retained Profit Share Split
            </span>
            <div className="text-2xl font-serif font-bold text-[#4A6741] mt-2">
              {formatNaira(scaleProjectedCorporateShare)}
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-natural-600 font-bold">
              <div className="flex justify-between">
                <span>Corporate Admin Take:</span>
                <span className="font-bold text-[#4A6741] font-mono">{formatNaira(scaleProjectedCorporateShare)}</span>
              </div>
              <div className="flex justify-between">
                <span>Investor Distributions:</span>
                <span className="font-mono text-natural-800">{formatNaira(scaleProjectedInvestorPayout)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

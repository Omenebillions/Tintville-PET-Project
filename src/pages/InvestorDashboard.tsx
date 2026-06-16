import React, { useMemo, useState } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import { TrendingUp, Package, ChevronRight, Activity, Wallet, X, PieChart, Coins, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Cycle } from "../types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function InvestorDashboard() {
  const { cycles, settings } = useAppContext();
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>("0");
  const [paymentStage, setPaymentStage] = useState(false);

  const activeCycles = cycles.filter(c => c.status !== "completed");
  const completedCycles = cycles.filter(c => c.status === "completed");

  const portfolio = useMemo(() => {
    let totalInvested = 0;
    let totalReturned = 0;

    activeCycles.forEach(c => {
      totalInvested += c.targetFundNeeded; // Simplified model: they provided target funds
    });

    completedCycles.forEach(c => {
      totalInvested += c.totalExpenses; // Or targetFundNeeded
      totalReturned += c.investorPayout;
    });

    return { totalInvested, totalReturned };
  }, [activeCycles, completedCycles]);

  const chartData = useMemo(() => {
    return [...cycles]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(c => {
        const expectedReturn = c.targetFundNeeded * ((settings.sellPricePerKg - settings.buyPricePerKg) / settings.buyPricePerKg) * settings.investorSharePercent;
        return {
          name: c.name,
          date: new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          "Capital Deployed": c.targetFundNeeded,
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
    setInvestmentAmount((cycle.targetFundNeeded * settings.minInvestmentPercent).toString() || "0");
    setPaymentStage(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-natural-900">
            Investor Portfolio
          </h2>
          <p className="text-natural-600 mt-2 text-sm font-bold">
            Real-time transparency on active operations and historic returns.
          </p>
        </div>
      </div>

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
              const expectedReturn = cycle.targetFundNeeded * (settings.sellPricePerKg / settings.buyPricePerKg - 1) * settings.investorSharePercent; // simplified heuristic

              return (
                <div 
                  key={cycle.id}
                  onClick={() => handleCycleSelect(cycle)}
                  className="bg-white p-6 rounded-[2rem] border border-natural-300 shadow-sm hover:shadow-md hover:border-primary/50 transition cursor-pointer flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="font-serif font-bold text-lg text-natural-900">{cycle.name}</h4>
                       <p className="text-xs text-natural-600 mt-1">{new Date(cycle.date).toLocaleDateString()}</p>
                     </div>
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                        {cycle.status.replace("_", " ")}
                     </span>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-natural-600 mb-1">Funds Needed</div>
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

      {selectedCycle && (
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
                    <div className="space-y-3">
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
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3 flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Simulate Investment
                    </h4>
                    
                    <div className="bg-natural-50 p-4 rounded-xl border border-natural-200 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-1.5 flex justify-between">
                          <span>Investment Amount (\u20A6)</span>
                          <span className="text-primary">Min: {formatNaira(selectedCycle.targetFundNeeded * settings.minInvestmentPercent)}</span>
                        </label>
                        <input
                          type="number"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          min={selectedCycle.targetFundNeeded * settings.minInvestmentPercent}
                          max={selectedCycle.targetFundNeeded}
                          className="block w-full rounded-xl border-natural-300 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                        />
                      </div>

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
                            +{formatNaira(Number(investmentAmount) * ((settings.sellPricePerKg - settings.buyPricePerKg) / settings.buyPricePerKg) * settings.investorSharePercent)}
                          </div>
                        </div>
                      </div>
                    </div>
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
                  disabled={Number(investmentAmount) < selectedCycle.targetFundNeeded * settings.minInvestmentPercent}
                  className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary-dark transition text-sm shadow-md disabled:bg-natural-400"
                >
                  Lock In Investment
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert("Payment submitted for verification. Admin will confirm shortly.");
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
      )}
    </div>
  );
}

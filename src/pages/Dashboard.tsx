import React, { useMemo } from "react";
import { useAppContext } from "../store/AppContext";
import { formatNaira } from "../lib/utils";
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

export default function Dashboard() {
  const { cycles, role } = useAppContext();

  const stats = useMemo(() => {
    let totalKg = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    let netProfit = 0;
    let investorPayout = 0;

    // A simplified timeframe: sum everything for MVP
    cycles
      .filter((c) => c.status === "completed")
      .forEach((c) => {
        totalKg += c.totalKgCollected;
        totalRevenue += c.revenue;
        totalExpenses += c.totalExpenses;
        netProfit += c.netProfit;
        investorPayout += c.investorPayout;
      });

    return { totalKg, totalRevenue, totalExpenses, netProfit, investorPayout };
  }, [cycles]);

  const chartData = useMemo(() => {
    // Group by month/cycle simplified
    return cycles
      .filter((c) => c.status === "completed")
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
      .slice(-6); // last 6 cycles
  }, [cycles]);

  if (role === 'investor') {
    return <InvestorDashboard />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Processed */}
        <div className="bg-white p-5 rounded-[2rem] md:rounded-3xl border border-natural-300 shadow-sm flex flex-col justify-between h-32">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest">
            Processed Volume
          </span>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-2xl md:text-3xl font-serif font-bold text-natural-800">
              {stats.totalKg.toLocaleString()}
            </span>
            <span className="text-xs md:text-sm font-bold text-primary">kg</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-[2rem] md:rounded-3xl border border-natural-300 shadow-sm flex flex-col justify-between h-32">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-auto truncate pr-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-natural-800 truncate">
              {formatNaira(stats.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-[2rem] md:rounded-3xl border border-natural-300 shadow-sm flex flex-col justify-between h-32">
          <span className="text-[10px] md:text-xs text-natural-600 font-bold uppercase tracking-widest">
            System Net Profit
          </span>
          <div className="flex items-baseline gap-1 mt-auto truncate pr-2">
            <span className="text-2xl md:text-3xl font-serif font-bold text-primary truncate">
              {formatNaira(stats.netProfit)}
            </span>
          </div>
        </div>

        {/* Investor Share */}
        <div className="bg-primary p-5 rounded-[2rem] md:rounded-3xl shadow-sm flex flex-col justify-between text-white h-32">
          <span className="text-[10px] md:text-xs opacity-70 font-bold uppercase tracking-widest">
            Investor Payouts
          </span>
          <div className="flex items-baseline gap-1 mt-auto truncate pr-2">
            <span className="text-2xl md:text-3xl font-serif font-bold truncate">
              {formatNaira(stats.investorPayout)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-natural-300 shadow-sm">
        <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-6 md:mb-8">
          Recent Cycle Performance
        </h3>
        {chartData.length > 0 ? (
          <div className="h-64 md:h-80 -ml-5 md:ml-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D6D9CE"
                />
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
                    fontWeight: 'bold',
                    color: '#2D3A28',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "kg")
                      return [
                        value.toLocaleString() + " kg",
                        "Volume Processed",
                      ];
                    return [
                      formatNaira(value),
                      name === "revenue" ? "Revenue" : "Net Profit",
                    ];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="kg"
                  fill="#CBD1B4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="#828D7A"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="right"
                  dataKey="profit"
                  fill="#4A6741"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
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

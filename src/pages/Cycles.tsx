import React, { useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import { Plus, CheckCircle2, Circle, ChevronRight, Trash2 } from "lucide-react";

function CycleList() {
  const { cycles, role } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
          Funding & Investment Cycles
        </h3>
        {role === "admin" && (
          <button
            onClick={() => navigate("new")}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Funding Round
          </button>
        )}
      </div>

      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-x-auto p-2">
        {cycles.length === 0 ? (
          <div className="p-8 text-center text-natural-600 italic">
            No cycles recorded yet.
          </div>
        ) : (
          <div className="min-w-[600px]">
          <table className="w-full text-left text-sm">
            <thead className="text-natural-600 uppercase text-xs font-bold bg-natural-50 rounded-2xl">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl rounded-bl-2xl">Cycle Name / Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Volume (kg)</th>
                <th className="px-6 py-4">Net Profit</th>
                <th className="px-6 py-4 rounded-tr-2xl rounded-br-2xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-100">
              {cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className="hover:bg-natural-50 transition cursor-pointer"
                  onClick={() => navigate(cycle.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-natural-900">
                      {cycle.name || "Unnamed Cycle"}
                    </div>
                    <div className="text-natural-600 text-xs mt-0.5">
                      {new Date(cycle.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cycle.status !== "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-natural-200 text-primary border border-natural-400 capitalize whitespace-nowrap">
                        <Circle className="w-3 h-3 fill-primary text-primary" />{" "}
                        {cycle.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-natural-500 text-natural-900 border border-natural-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-natural-800">
                    {cycle.totalKgCollected.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "font-bold",
                        cycle.netProfit >= 0
                          ? "text-primary"
                          : "text-red-600",
                      )}
                    >
                      {formatNaira(cycle.netProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-natural-400 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CycleNew() {
  const { settings, addCycle, role } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [volumeTons, setVolumeTons] = useState("1.5");
  const [items, setItems] = useState<{name: string, amount: number}[]>([
    { name: "Running Capital (Logistics & Labor)", amount: 50000 },
    { name: "Infrastructure & Ops Maintenance", amount: 20000 }
  ]);

  if (role !== "admin") {
    return <div className="p-6 text-center text-slate-500">Access Denied</div>;
  }

  const materialCost = Math.max(Number(volumeTons), 1.5) * 1000 * settings.buyPricePerKg;
  const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const targetFundNeededValue = materialCost + itemsTotal;

  const handleCreate = () => {
    // Initial cost calculations from recurring expenses
    const recurringTotal = settings.recurringExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    addCycle({
      name: name || `Cycle ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: "collation",
      targetFundNeeded: targetFundNeededValue,
      expectedPayment: 0,
      totalKgCollected: 0,
      buyPricePerKg: settings.buyPricePerKg,
      sellPricePerKg: settings.sellPricePerKg,
      expenses: {
        plasticPurchaseCost: 0,
        transportCost: 0,
        laborCost: 0,
        equipmentCostAllocated: recurringTotal,
        miscCost: 0,
      },
      revenue: 0,
      totalExpenses: recurringTotal,
      netProfit: -recurringTotal,
      investorPayout: 0,
      adminPayout: 0,
    });
    navigate("/cycles");
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", amount: 0 }]);
  };

  const updateItem = (index: number, field: "name" | "amount", value: string) => {
    const newItems = [...items];
    if (field === "name") newItems[index].name = value;
    if (field === "amount") newItems[index].amount = Number(value);
    setItems(newItems);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-[2.5rem] border border-natural-300 shadow-sm mt-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">New Funding Round</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-natural-700 mb-2">
            Funding Round Name
          </label>
          <input
            type="text"
            placeholder="e.g. Nov Week 1 Batch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl border-natural-400 border px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-natural-900 font-bold"
          />
        </div>

        <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
          <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest mb-2 flex justify-between">
            <span>Target Volume (Tons)</span>
            <span className="text-primary">Min: 1.5 Tons</span>
          </label>
          <input
            type="number"
            min="1.5"
            step="0.1"
            value={volumeTons}
            onChange={(e) => setVolumeTons(e.target.value)}
            className="block w-full rounded-xl border-natural-300 border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
          />
          <div className="mt-2 text-xs text-natural-600 font-bold">
            Projected Material Cost: {formatNaira(materialCost)} ({Math.max(Number(volumeTons), 1.5) * 1000}kg @ {formatNaira(settings.buyPricePerKg)}/kg)
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
             <label className="block text-[10px] font-bold text-natural-700 uppercase tracking-widest">
               Additional Funding Items
             </label>
             <button onClick={handleAddItem} className="text-xs font-bold text-primary hover:text-primary-dark">
               + Add Item
             </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                  className="flex-1 rounded-xl border-natural-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount || ""}
                  onChange={(e) => updateItem(idx, "amount", e.target.value)}
                  className="w-32 rounded-xl border-natural-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900"
                />
                <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-natural-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
          <div>
            <div className="text-[10px] text-natural-400 uppercase tracking-widest font-bold mb-1">Total Target Fund</div>
            <div className="text-2xl font-serif font-bold">{formatNaira(targetFundNeededValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-natural-400 uppercase tracking-widest font-bold mb-1">Proj. Return</div>
            <div className="text-sm font-bold text-green-400">
              +{formatNaira(targetFundNeededValue * ((settings.sellPricePerKg - settings.buyPricePerKg) / settings.buyPricePerKg) * settings.investorSharePercent)}
            </div>
          </div>
        </div>

        <div className="p-4 bg-natural-100 rounded-2xl border border-natural-300 text-xs text-natural-700 space-y-1">
          <p><strong>Config Snapshots:</strong> Buy: {formatNaira(settings.buyPricePerKg)} | Sell: {formatNaira(settings.sellPricePerKg)} | Investor Share: {Math.round(settings.investorSharePercent * 100)}%</p>
        </div>
        
        <button
          onClick={handleCreate}
          className="w-full bg-primary text-white px-4 py-4 rounded-full font-bold hover:bg-primary-dark transition-colors shadow-lg"
        >
          Publish Call for Investment
        </button>
      </div>
    </div>
  );
}

function CycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cycles, updateCycle, role, settings, addTransaction, deleteCycle } =
    useAppContext();
  const cycle = cycles.find((c) => c.id === id);

  const [editMode, setEditMode] = useState(false);
  const [targetFundNeededEdit, setTargetFundNeededEdit] = useState(cycle?.targetFundNeeded?.toString() || "0");
  const [kg, setKg] = useState(cycle?.totalKgCollected.toString() || "0");
  const [transport, setTransport] = useState(
    cycle?.expenses.transportCost.toString() || "0",
  );
  const [labor, setLabor] = useState(
    cycle?.expenses.laborCost.toString() || "0",
  );
  const [misc, setMisc] = useState(cycle?.expenses.miscCost.toString() || "0");
  const [expectedPayment, setExpectedPayment] = useState(cycle?.expectedPayment?.toString() || "0");

  if (!cycle)
    return (
      <div className="p-6 text-center text-slate-500">Cycle not found</div>
    );

  const handleSave = () => {
    const parsedKg = Number(kg);
    const parsedTargetFundNeeded = Number(targetFundNeededEdit);
    const parsedTransport = Number(transport);
    const parsedLabor = Number(labor);
    const parsedMisc = Number(misc);
    const parsedExpectedPayment = Number(expectedPayment);

    const plasticCost = parsedKg * cycle.buyPricePerKg;
    const revenue = parsedKg * cycle.sellPricePerKg;
    const totalExp =
      plasticCost +
      parsedTransport +
      parsedLabor +
      cycle.expenses.equipmentCostAllocated +
      parsedMisc;
    
    // For completed stage logic, netProfit might be driven by actual expectedPayment if it's there
    let calcRevenue = revenue;
    if (cycle.status === "payment_awaited" && parsedExpectedPayment > 0) {
      calcRevenue = parsedExpectedPayment;
    }

    const netProfit = calcRevenue - totalExp;

    updateCycle(cycle.id, {
      targetFundNeeded: parsedTargetFundNeeded,
      totalKgCollected: parsedKg,
      revenue: calcRevenue,
      expectedPayment: parsedExpectedPayment,
      expenses: {
        ...cycle.expenses,
        plasticPurchaseCost: plasticCost,
        transportCost: parsedTransport,
        laborCost: parsedLabor,
        miscCost: parsedMisc,
      },
      totalExpenses: totalExp,
      netProfit,
      investorPayout:
        netProfit > 0 ? netProfit * settings.investorSharePercent : 0,
      adminPayout:
        netProfit > 0
          ? netProfit * (1 - settings.investorSharePercent)
          : netProfit, // admin takes the loss
    });
    setEditMode(false);
  };

  const advanceStage = () => {
    handleSave(); // save updates first

    if (cycle.status === "collation" || cycle.status === "active") {
       updateCycle(cycle.id, { status: "transport" });
    } else if (cycle.status === "transport") {
       updateCycle(cycle.id, { status: "payment_awaited" });
    } else if (cycle.status === "payment_awaited") {
       updateCycle(cycle.id, { status: "completed" });
       
       // Add ledger entries
       addTransaction({
         date: new Date().toISOString(),
         type: "Expense",
         category: "Cycle Expense",
         description: `Total expenses for ${cycle.name}`,
         amount: cycle.totalExpenses,
         cycleId: cycle.id,
       });
       addTransaction({
         date: new Date().toISOString(),
         type: "Income",
         category: "Cycle Revenue",
         description: `Confirmed Payment from ${cycle.name}`,
         amount: cycle.revenue,
         cycleId: cycle.id,
       });
       if (cycle.investorPayout > 0) {
         addTransaction({
           date: new Date().toISOString(),
           type: "Expense",
           category: "Investor Payout",
           description: `Profit share payout for ${cycle.name}`,
           amount: cycle.investorPayout,
           cycleId: cycle.id,
         });
       }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-natural-900">
            {cycle.name}
          </h2>
          <p className="text-natural-600 mt-2 flex items-center gap-2 text-sm font-bold truncate">
            Started {new Date(cycle.date).toLocaleDateString()}
            <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-mono bg-natural-300 text-natural-800 truncate max-w-[120px]">
              ID: {cycle.id}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
          {role === "admin" && (
            <button
              onClick={() => {
                deleteCycle(cycle.id);
                navigate('/cycles');
              }}
              className="flex-1 sm:flex-none justify-center bg-white border-2 border-red-200 text-red-600 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-red-50 flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4 hidden sm:block" />
              Delete
            </button>
          )}
          {role === "admin" && cycle.status !== "completed" && (
            <>
              {editMode ? (
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none justify-center bg-primary text-white px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-primary-dark transition"
                >
                  Save Values
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 sm:flex-none justify-center bg-white border-2 border-natural-300 text-natural-800 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-natural-100 transition"
                >
                  Edit Values
                </button>
              )}
              <button
                onClick={advanceStage}
                className="flex-1 sm:flex-none justify-center bg-primary text-white px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-primary-dark flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4 hidden sm:block" />
                {cycle.status === "collation" || cycle.status === "active" ? "Move to Transport" : cycle.status === "transport" ? "Move to Payment Awaited" : cycle.status === "payment_awaited" ? "Confirm Payment" : "Move Next"}

              </button>
            </>
          )}
          {cycle.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-natural-500 text-natural-900 border border-natural-600 w-full sm:w-auto justify-center">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white border border-natural-300 rounded-[2rem] shadow-sm overflow-hidden p-5 md:p-6">
            <div className="pb-4 border-b border-natural-300 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">
              Metrics & Inputs
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                  Target Fund Needed
                </label>
                {editMode ? (
                  <input
                    type="number"
                    value={targetFundNeededEdit}
                    onChange={(e) => setTargetFundNeededEdit(e.target.value)}
                    className="w-full border-natural-400 rounded-xl focus:ring-primary focus:outline-none border p-3 font-bold text-natural-900"
                  />
                ) : (
                  <div className="text-2xl md:text-3xl font-serif font-bold text-natural-900">
                    {formatNaira(cycle.targetFundNeeded)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                  Total Volume Collected
                </label>
                {editMode ? (
                  <input
                    type="number"
                    value={kg}
                    onChange={(e) => setKg(e.target.value)}
                    className="w-full border-natural-400 rounded-xl focus:ring-primary focus:outline-none border p-3 font-bold text-natural-900"
                  />
                ) : (
                  <div className="text-2xl md:text-3xl font-serif font-bold text-natural-900">
                    {cycle.totalKgCollected.toLocaleString()} <span className="text-sm md:text-lg text-primary font-sans">kg</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                  Derived Revenue
                </label>
                <div className="text-2xl md:text-3xl font-serif font-bold text-natural-900 truncate">
                  {formatNaira(cycle.revenue)}
                </div>
                <div className="text-[10px] md:text-xs text-natural-600 mt-1 font-bold truncate">
                  @ {formatNaira(cycle.sellPricePerKg)} / kg
                </div>
              </div>
              {(cycle.status === "payment_awaited" || cycle.status === "completed") && (
                <div>
                  <label className="block text-xs font-bold text-natural-700 uppercase tracking-widest mb-2">
                    Confirmed Payment
                  </label>
                  {editMode && cycle.status !== "completed" ? (
                      <input
                        type="number"
                        value={expectedPayment}
                        onChange={(e) => setExpectedPayment(e.target.value)}
                        className="w-full border-natural-400 rounded-xl focus:ring-primary focus:outline-none border p-3 font-bold text-natural-900"
                      />
                  ) : (
                    <div className="text-2xl md:text-3xl font-serif font-bold text-primary truncate">
                      {formatNaira(cycle.expectedPayment || 0)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-natural-300 rounded-[2rem] shadow-sm overflow-hidden p-5 md:p-6">
            <div className="pb-4 border-b border-natural-300 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">
              Expenses Breakdown
            </div>
            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-natural-100 flex-wrap gap-2">
                <span className="text-natural-700 font-medium whitespace-nowrap">
                  Plastic Purchase Cost{" "}
                  <span className="text-[10px] md:text-xs text-natural-600 ml-1 md:ml-2">
                    (@ {formatNaira(cycle.buyPricePerKg)}/kg)
                  </span>
                </span>
                <span className="font-bold text-natural-900">
                  {formatNaira(cycle.expenses.plasticPurchaseCost)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-natural-100">
                <span className="text-natural-700 font-medium">Transport & Logistics</span>
                {editMode ? (
                  <input
                    type="number"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    className="w-24 md:w-32 border-natural-400 rounded-lg focus:outline-none focus:ring-primary text-right p-2 border font-bold"
                  />
                ) : (
                  <span className="font-bold text-natural-900">
                    {formatNaira(cycle.expenses.transportCost)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-natural-100">
                <span className="text-natural-700 font-medium">Labor Cost</span>
                {editMode ? (
                  <input
                    type="number"
                    value={labor}
                    onChange={(e) => setLabor(e.target.value)}
                    className="w-24 md:w-32 border-natural-400 rounded-lg focus:outline-none focus:ring-primary text-right p-2 border font-bold"
                  />
                ) : (
                  <span className="font-bold text-natural-900">
                    {formatNaira(cycle.expenses.laborCost)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-natural-100">
                <span className="text-natural-700 font-medium">Misc Cost</span>
                {editMode ? (
                  <input
                    type="number"
                    value={misc}
                    onChange={(e) => setMisc(e.target.value)}
                    className="w-24 md:w-32 border-natural-400 rounded-lg focus:outline-none focus:ring-primary text-right p-2 border font-bold"
                  />
                ) : (
                  <span className="font-bold text-natural-900">
                    {formatNaira(cycle.expenses.miscCost)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-natural-100">
                <span className="text-natural-700 font-medium">
                  Equipment Allocation (Fixed)
                </span>
                <span className="font-bold text-natural-900">
                  {formatNaira(cycle.expenses.equipmentCostAllocated)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold text-natural-900 uppercase tracking-widest text-[10px] md:text-xs">
                  Total Expenses
                </span>
                <span className="font-serif font-bold text-lg md:text-xl text-natural-900">
                  {formatNaira(cycle.totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-primary rounded-[2rem] shadow-sm text-white overflow-hidden relative p-5 md:p-6">
            <div className="pb-4 border-b border-natural-400/30 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-4">
              Profit Calculation
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Revenue</div>
                <div className="text-xl md:text-2xl font-serif font-bold truncate">
                  {formatNaira(cycle.revenue)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Expenses</div>
                <div className="text-xl md:text-2xl font-serif font-bold opacity-90 truncate">
                  - {formatNaira(cycle.totalExpenses)}
                </div>
              </div>
              <div className="h-px bg-natural-400/30 my-4" />
              <div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Net Profit</div>
                <div
                  className={cn(
                    "text-3xl md:text-4xl font-serif font-bold truncate",
                    cycle.netProfit >= 0 ? "text-[#E8AE3D]" : "text-red-300",
                  )}
                >
                  {formatNaira(cycle.netProfit)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-natural-200 border border-natural-400 rounded-[2rem] shadow-sm overflow-hidden p-5 md:p-6">
            <div className="pb-4 border-b border-natural-400 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">
              Distributions
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-natural-800 font-bold text-sm md:text-base">
                  Investor Payout{" "}
                  <span className="text-[10px] md:text-xs text-natural-600 md:ml-1 block md:inline">
                    ({settings.investorSharePercent * 100}%)
                  </span>
                </span>
                <span className="font-serif font-bold text-lg md:text-xl text-primary">
                  {formatNaira(cycle.investorPayout)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-natural-800 font-bold text-sm md:text-base">Admin Share</span>
                <span className="font-serif font-bold text-lg md:text-xl text-natural-900">
                  {formatNaira(cycle.adminPayout)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cycles() {
  return (
    <Routes>
      <Route path="/" element={<CycleList />} />
      <Route path="new" element={<CycleNew />} />
      <Route path=":id" element={<CycleDetail />} />
    </Routes>
  );
}

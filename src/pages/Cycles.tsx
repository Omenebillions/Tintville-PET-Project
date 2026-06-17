import React, { useState } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../store/AppContext";
import { formatNaira, cn } from "../lib/utils";
import { Plus, CheckCircle2, Circle, ChevronRight, Trash2, Clock, Coins, DollarSign, TrendingUp, ArrowRight, ShieldCheck, AlertCircle, PiggyBank, FileText, Wallet, RotateCcw } from "lucide-react";

function CycleList() {
  const { cycles, role, restoreCycle, deleteCycle } = useAppContext();
  const navigate = useNavigate();
  const [listTab, setListTab] = useState<"active" | "trash">("active");

  const activeInList = cycles.filter(c => !c.isDeleted);
  const trashedInList = cycles.filter(c => c.isDeleted);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2.5rem] border border-natural-300 shadow-sm">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Funding & Investment Cycles
          </h3>
          <p className="text-[10px] sm:text-xs text-natural-600 font-bold uppercase tracking-widest mt-1">
            Publish campaigns, track operating parameters, and audit settlement distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {role === "admin" && (
            <div className="flex bg-natural-100 p-1 rounded-full border border-natural-300">
              <button
                onClick={() => setListTab("active")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  listTab === "active"
                    ? "bg-white shadow-xs text-natural-900 border border-natural-200"
                    : "text-natural-500 hover:text-natural-800"
                )}
              >
                Main Board
              </button>
              <button
                onClick={() => setListTab("trash")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1",
                  listTab === "trash"
                    ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                    : "text-red-500 hover:text-red-800"
                )}
              >
                Trash ({trashedInList.length})
              </button>
            </div>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("new")}
              className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Funding Round
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-sm overflow-x-auto p-2">
        {listTab === "active" ? (
          activeInList.length === 0 ? (
            <div className="p-12 text-center text-natural-500 italic text-sm">
              No active operational cycles recorded yet. Start a new round to launch.
            </div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="text-natural-600 uppercase text-[10px] tracking-wider font-bold bg-natural-50/50">
                  <tr>
                    <th className="px-6 py-3.5 rounded-l-xl">Cycle Name / Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Volume (kg)</th>
                    <th className="px-6 py-3.5">Net Profit</th>
                    <th className="px-6 py-3.5 text-right rounded-r-xl"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100 font-medium">
                  {activeInList.map((cycle) => (
                    <tr
                      key={cycle.id}
                      className="hover:bg-natural-50/50 transition cursor-pointer"
                      onClick={() => navigate(cycle.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-natural-900 text-sm md:text-base">
                          {cycle.name || "Unnamed Cycle"}
                        </div>
                        <div className="text-natural-600 text-[10px] md:text-xs mt-0.5">
                          Publish date: {new Date(cycle.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cycle.status !== "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize whitespace-nowrap">
                            <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />{" "}
                            {cycle.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-natural-500 text-natural-900 border border-natural-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-natural-800 text-xs md:text-sm">
                        {cycle.totalKgCollected.toLocaleString()} kg
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "font-bold text-xs md:text-sm",
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
          )
        ) : (
          trashedInList.length === 0 ? (
            <div className="p-12 text-center text-natural-500 italic text-sm">
              Cycles Trash Bin is currently empty.
            </div>
          ) : (
            <div className="min-w-[600px] p-2 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-xs font-bold leading-normal">
                  Trashed cycles are temporarily stored here. Restore to return them to the active system or Permanently Delete them.
                </p>
              </div>

              <table className="w-full text-left text-sm border-collapse">
                <thead className="text-natural-600 uppercase text-[10px] tracking-wider font-bold bg-red-50/50">
                  <tr>
                    <th className="px-6 py-3.5 rounded-l-xl">Cycle Name / Date</th>
                    <th className="px-6 py-3.5">Previous Status</th>
                    <th className="px-6 py-3.5 text-right">Target Funded Needed</th>
                    <th className="px-6 py-3.5 text-center rounded-r-xl">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-100 font-medium">
                  {trashedInList.map((cycle) => (
                    <tr key={cycle.id} className="hover:bg-red-50/10 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-red-950 text-sm">
                          {cycle.name}
                        </div>
                        <div className="text-natural-500 text-[10px] mt-0.5">
                          Deleted At: {cycle.deletedAt ? new Date(cycle.deletedAt).toLocaleString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-1.5 py-0.5 rounded bg-natural-100 border border-natural-300 text-[9px] uppercase tracking-wider font-bold text-natural-700">
                          {cycle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-natural-800 text-xs md:text-sm font-mono">
                        {formatNaira(cycle.targetFundNeeded)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-2 justify-center">
                          <button
                            onClick={() => restoreCycle(cycle.id)}
                            className="bg-[#E8EFE5] border border-[#CBDCC4] text-[#4A6741] hover:bg-[#CBDCC4] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently erase ${cycle.name}? This is irreversible!`)) {
                                deleteCycle(cycle.id, true);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition"
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
          )
        )}
      </div>
    </div>
  );
}

function CycleNew() {
  const { settings, addCycle, role } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [volumeTons, setVolumeTons] = useState("2.0");
  const [items, setItems] = useState<{name: string, amount: number, isEquipment?: boolean}[]>([
    { name: "Transport Logistics", amount: 250000, isEquipment: false },
    { name: "Labor Sorter Deployment", amount: 100000, isEquipment: false },
    { name: "Infrastructure & Ops Maintenance", amount: 50000, isEquipment: false }
  ]);

  if (role !== "admin") {
    return <div className="p-6 text-center text-slate-500">Access Denied</div>;
  }

  const materialCost = Math.max(Number(volumeTons), 1.5) * 1000 * settings.buyPricePerKg;
  const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const targetFundNeededValue = materialCost + itemsTotal;

  const equipmentTotal = items.filter(i => i.isEquipment).reduce((sum, i) => sum + i.amount, 0);
  const operationalItemsTotal = items.filter(i => !i.isEquipment).reduce((sum, i) => sum + i.amount, 0);
  const workingCapital = materialCost + operationalItemsTotal;

  // Expected return is earned ONLY on Working/Operating capital (including material)
  const projectedReturnOnWorkingCapital = workingCapital * ((settings.sellPricePerKg - settings.buyPricePerKg) / settings.buyPricePerKg) * settings.investorSharePercent;

  const handleCreate = () => {
    const targetKg = Math.max(Number(volumeTons), 1.5) * 1000;
    const materialCostValue = targetKg * settings.buyPricePerKg;

    // Find custom transport/labor costs from items
    const transportItem = items.find(
      (it) =>
        it.name.toLowerCase().includes("transport") ||
        it.name.toLowerCase().includes("logistics")
    );
    const laborItem = items.find(
      (it) =>
        it.name.toLowerCase().includes("labor") ||
        it.name.toLowerCase().includes("sorter")
    );
    const miscItemSum = items
      .filter(
        (it) =>
          !it.isEquipment &&
          !it.name.toLowerCase().includes("transport") &&
          !it.name.toLowerCase().includes("logistics") &&
          !it.name.toLowerCase().includes("labor") &&
          !it.name.toLowerCase().includes("sorter")
      )
      .reduce((sum, it) => sum + it.amount, 0);

    const transpCost = transportItem ? transportItem.amount : 0;
    const laborCost = laborItem ? laborItem.amount : 0;

    // Initial cost calculations from recurring expenses (equipment allocated)
    const recurringTotal = settings.recurringExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    const initialTotalExpenses = materialCostValue + transpCost + laborCost + miscItemSum;
    const initialRevenue = targetKg * settings.sellPricePerKg;

    addCycle({
      name: name || `Cycle ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: "awaiting_funds",
      targetFundNeeded: targetFundNeededValue,
      expectedPayment: initialRevenue,
      totalKgCollected: targetKg,
      buyPricePerKg: settings.buyPricePerKg,
      sellPricePerKg: settings.sellPricePerKg,
      expenses: {
        plasticPurchaseCost: materialCostValue,
        transportCost: transpCost,
        laborCost: laborCost,
        equipmentCostAllocated: recurringTotal,
        miscCost: miscItemSum,
      },
      revenue: initialRevenue,
      totalExpenses: initialTotalExpenses,
      netProfit: initialRevenue - (materialCostValue + transpCost + miscItemSum),
      investorPayout: 0,
      adminPayout: 0,
      fundingItems: [
        { name: `${Math.max(Number(volumeTons), 1.5)} Tons PET Plastic Purchase`, amount: materialCostValue, isEquipment: false },
        ...items.map(it => ({
          name: it.name,
          amount: it.amount,
          isEquipment: !!it.isEquipment
        }))
      ],
      investors: [],
      expensesList: []
    });
    navigate("/cycles");
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", amount: 0, isEquipment: false }]);
  };

  const updateItem = (index: number, field: "name" | "amount" | "isEquipment", value: any) => {
    const newItems = [...items];
    if (field === "name") newItems[index].name = value;
    if (field === "amount") newItems[index].amount = Number(value);
    if (field === "isEquipment") newItems[index].isEquipment = !!value;
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
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-3 p-4 bg-natural-50 rounded-2xl border border-natural-200">
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="flex-1 rounded-xl border-natural-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount || ""}
                    onChange={(e) => updateItem(idx, "amount", e.target.value)}
                    className="w-32 rounded-xl border-natural-300 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                  />
                  <button 
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-1 bg-white p-2 rounded-lg border border-natural-200">
                  <input
                    type="checkbox"
                    id={`is-equip-${idx}`}
                    checked={!!item.isEquipment}
                    onChange={(e) => updateItem(idx, "isEquipment", e.target.checked)}
                    className="rounded border-natural-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor={`is-equip-${idx}`} className="text-xs font-bold text-natural-600 cursor-pointer select-none">
                    Equipment / Fixed Asset (Does not generate immediate cycle income)
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200 space-y-2 text-xs text-natural-700">
          <div className="flex justify-between font-bold border-b border-natural-200 pb-1.5 uppercase text-[10px] tracking-wider text-natural-600 mb-2">
            <span>Funding Breakdown</span>
            <span>Est. Amount</span>
          </div>
          <div className="flex justify-between">
            <span>Material Cost:</span>
            <span className="font-bold">{formatNaira(materialCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Operating Expenses:</span>
            <span className="font-bold">{formatNaira(operationalItemsTotal)}</span>
          </div>
          <div className="flex justify-between text-amber-700 font-bold">
            <span>Equipment / CAPEX:</span>
            <span>{formatNaira(equipmentTotal)}</span>
          </div>
          <div className="pt-2 border-t border-natural-200 flex justify-between font-bold text-natural-900 uppercase text-[10px] tracking-wider">
            <span>Active Working Capital (Yielding immediate ROI):</span>
            <span className="text-green-700 font-mono text-xs">{formatNaira(workingCapital)}</span>
          </div>
        </div>

        <div className="p-5 bg-natural-900 text-white rounded-[2rem] flex justify-between items-center shadow-lg">
          <div>
            <div className="text-[10px] text-natural-400 uppercase tracking-widest font-bold mb-1">Total Target Fund</div>
            <div className="text-2xl font-serif font-bold">{formatNaira(targetFundNeededValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-natural-400 uppercase tracking-widest font-bold mb-1">Proj. Return (on working cap)</div>
            <div className="text-sm font-bold text-green-400">
              +{formatNaira(projectedReturnOnWorkingCapital)}
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

  // Stage expense inputs
  const [stageExpenseName, setStageExpenseName] = useState("");
  const [stageExpenseAmount, setStageExpenseAmount] = useState("");

  // Manual Investor addition inputs
  const [newInvestorName, setNewInvestorName] = useState("");
  const [newInvestorAmount, setNewInvestorAmount] = useState("");
  const [showDeleteWarn, setShowDeleteWarn] = useState(false);

  if (!cycle)
    return (
      <div className="p-6 text-center text-slate-500">Cycle not found</div>
    );

  // Core Financial Calculations
  const cycleInvestors = cycle.investors || [];
  const approvedInvestors = cycleInvestors.filter((i) => i.approved);
  const totalApprovedCapital = approvedInvestors.reduce((sum, i) => sum + i.amount, 0);

  const stageExpensesTotal = (cycle.expensesList || []).reduce((sum, e) => sum + e.amount, 0);

  // Plastic purchase is removed at "transport" stage onwards
  const isPlasticDeducted = cycle.status !== "awaiting_funds" && cycle.status !== "collation";
  const plasticPurchaseCost = cycle.expenses.plasticPurchaseCost || (cycle.totalKgCollected * cycle.buyPricePerKg);
  const activePlasticCost = isPlasticDeducted ? plasticPurchaseCost : 0;

  // Transport & Labor is removed at "payment_awaited" stage onwards (when transport was completed)
  const isTransportCompleted = cycle.status === "payment_awaited" || cycle.status === "completed";
  const activeTransportCost = isTransportCompleted ? cycle.expenses.transportCost : 0;
  const activeLaborCost = isTransportCompleted ? cycle.expenses.laborCost : 0;

  // Equipment allocation should not be deducted yet.
  const isEquipDeducted = false;
  const activeEquipCost = 0;

  // Revenue increases when payment is confirmed
  const isRevenueAdded = cycle.status === "completed";
  const activeRevenue = isRevenueAdded ? cycle.revenue : 0;

  const liveBalance = totalApprovedCapital - stageExpensesTotal - activePlasticCost - activeTransportCost - activeLaborCost - activeEquipCost + activeRevenue;

  const handleSave = () => {
    const parsedKg = Number(kg);
    const parsedTargetFundNeeded = Number(targetFundNeededEdit);
    const parsedTransport = Number(transport);
    const parsedLabor = Number(labor);
    const parsedMisc = Number(misc);
    const parsedExpectedPayment = Number(expectedPayment);

    const plasticCost = parsedKg * 300;
    const revenue = parsedKg * 510;
    
    // Total expenses should exclude Equipment Allocation (not deducted yet) and focus on operational/running/labor cost
    const totalExp =
      plasticCost +
      parsedTransport +
      parsedLabor +
      parsedMisc;
    
    // Profit is revenue generated - running cost (including added/misc expenses during the cycle)
    const runningCost = plasticCost + parsedTransport + parsedMisc;
    const netProfit = revenue - runningCost;

    updateCycle(cycle.id, {
      targetFundNeeded: parsedTargetFundNeeded,
      totalKgCollected: parsedKg,
      revenue: revenue,
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

    if (cycle.status === "awaiting_funds") {
       updateCycle(cycle.id, { status: "collation" });
    } else if (cycle.status === "collation" || cycle.status === "active") {
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

  // Stage-specific expense logging handler
  const handleAddStageExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageExpenseName || !stageExpenseAmount) return;
    const amountNum = Number(stageExpenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newExpense = {
      id: Date.now().toString() + Math.random().toString(),
      name: stageExpenseName,
      amount: amountNum,
      stage: cycle.status,
      date: new Date().toISOString(),
    };

    const updatedExpensesList = [...(cycle.expensesList || []), newExpense];
    const newMiscCost = Number(misc) + amountNum; 
    setMisc(newMiscCost.toString());

    const parsedKg = Number(kg);
    const plasticCost = parsedKg * 300;
    const currentTransport = Number(transport);
    const currentLabor = Number(labor);
    const totalExp =
      plasticCost +
      currentTransport +
      currentLabor +
      newMiscCost;

    const revenue = parsedKg * 510;
    // Profit is revenue generated - running cost (including added/misc expenses during the cycle)
    const runningCost = plasticCost + currentTransport + newMiscCost;
    const netProfit = revenue - runningCost;

    updateCycle(cycle.id, {
      expensesList: updatedExpensesList,
      expenses: {
        ...cycle.expenses,
        miscCost: newMiscCost,
      },
      totalExpenses: totalExp,
      netProfit,
      investorPayout:
        netProfit > 0 ? netProfit * settings.investorSharePercent : 0,
      adminPayout:
        netProfit > 0
          ? netProfit * (1 - settings.investorSharePercent)
          : netProfit,
    });

    setStageExpenseName("");
    setStageExpenseAmount("");
  };

  // Manual Investor registration handler
  const handleAddInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestorName || !newInvestorAmount) return;
    const amountNum = Number(newInvestorAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const currentInvestors = cycle.investors || [];
    const totalApproved = currentInvestors.filter((i) => i.approved).reduce((sum, i) => sum + i.amount, 0);
    const capacityLeft = Math.max(0, cycle.targetFundNeeded - totalApproved);

    if (capacityLeft <= 0) {
      alert("This operational cycle is already 100% funded! No further investments can be registered.");
      return;
    }

    if (amountNum > capacityLeft) {
      alert(`Only ₦${capacityLeft.toLocaleString()} remains under this campaign's target. Manual investor amount cannot exceed this remaining portion.`);
      return;
    }

    const newInv = {
      id: Date.now().toString() + Math.random().toString(),
      name: newInvestorName.trim(),
      amount: amountNum,
      approved: true, // admin manually registers are approved
      date: new Date().toISOString(),
    };

    updateCycle(cycle.id, {
      investors: [...(cycle.investors || []), newInv],
    });

    setNewInvestorName("");
    setNewInvestorAmount("");
  };

  const handleApproveInvestor = (investorId: string) => {
    const inv = (cycle.investors || []).find((i) => i.id === investorId);
    if (!inv) return;

    const currentApproved = (cycle.investors || []).filter((i) => i.approved && i.id !== investorId).reduce((sum, i) => sum + i.amount, 0);
    const capacityLeft = Math.max(0, cycle.targetFundNeeded - currentApproved);

    if (capacityLeft <= 0) {
      alert("This operational cycle is already 100% funded by other approved investors! You cannot approve this investment.");
      return;
    }

    if (inv.amount > capacityLeft) {
      const confirmCap = window.confirm(
        `Approving this full investment of ₦${inv.amount.toLocaleString()} will exceed the remaining target capacity of ₦${capacityLeft.toLocaleString()}.\n\nWould you like to approve this investment capped at the remaining allowed balance of ₦${capacityLeft.toLocaleString()}?`
      );
      if (!confirmCap) return;
      
      const updated = (cycle.investors || []).map((i) =>
        i.id === investorId ? { ...i, amount: capacityLeft, approved: true } : i
      );
      updateCycle(cycle.id, {
        investors: updated,
      });
      return;
    }

    const updated = (cycle.investors || []).map((inv) =>
      inv.id === investorId ? { ...inv, approved: true } : inv
    );
    updateCycle(cycle.id, {
      investors: updated,
    });
  };

  // Modern Operational Progress Steps
  const steps = [
    { key: "awaiting_funds", label: "Awaiting Capital", desc: "Sourcing Funding" },
    { key: "collation", label: "Material Collection", desc: "Buying Sourced PET Plastics" },
    { key: "transport", label: "Transport & Logistics", desc: "Transferring to Buyers" },
    { key: "payment_awaited", label: "Payment Awaited", desc: "Awaiting Bank Settlement" },
    { key: "completed", label: "Completed & Settled", desc: "Payouts Shared Live" }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === cycle.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Controls */}
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
              onClick={() => setShowDeleteWarn(true)}
              className="flex-1 sm:flex-none justify-center bg-white border-2 border-red-200 text-red-600 px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-red-50 flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4 hidden sm:block" />
              Delete Campaign
            </button>
          )}
          {role === "admin" && (
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
              {cycle.status !== "completed" && (
                <button
                  onClick={advanceStage}
                  className="flex-1 sm:flex-none justify-center bg-primary text-white px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-primary-dark flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4 hidden sm:block" />
                  {cycle.status === "awaiting_funds" 
                    ? "Launch Collation Stage" 
                    : cycle.status === "collation" || cycle.status === "active" 
                    ? "Move to Transport" 
                    : cycle.status === "transport" 
                    ? "Move to Payment Awaited" 
                    : "Confirm Client Payment"}
                </button>
              )}
            </>
          )}
          {cycle.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-natural-500 text-natural-900 border border-natural-600 w-full sm:w-auto justify-center">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Operational Progress Tracker (Stepper) */}
      <div className="bg-white border border-natural-300 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Live Operational Stage Stepper
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Progress bar line on desktop */}
          <div className="hidden md:block absolute top-[18px] left-[10%] right-[10%] h-1 bg-natural-200 z-0" />
          {steps.map((st, index) => {
            const isActive = st.key === cycle.status;
            const isPassed = index < currentStepIndex;
            return (
              <div key={st.key} className="flex md:flex-col items-center md:text-center gap-3 relative z-10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition border-2 shrink-0 shadow-sm",
                    isActive
                      ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                      : isPassed
                      ? "bg-natural-500 border-natural-600 text-natural-900"
                      : "bg-white border-natural-300 text-natural-600"
                  )}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4 text-natural-900" /> : index + 1}
                </div>
                <div>
                  <div className={cn("text-xs font-bold", isActive ? "text-primary font-bold" : "text-natural-800")}>
                    {st.label}
                  </div>
                  <div className="text-[10px] text-natural-500 font-medium md:mt-0.5">{st.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {/* Real-time cash balance and timeline ledger */}
          <div className="bg-white border border-natural-300 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 overflow-hidden translate-x-3 -translate-y-3 opacity-10 pointer-events-none">
              <Wallet className="w-32 h-32 text-primary" />
            </div>
            <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                  Live Operational Capital Account
                </h3>
                <p className="text-[10px] text-natural-500 font-bold uppercase tracking-wider">
                  Real-time flow of funds inside the cycle
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                  {cycle.status === "awaiting_funds" ? "Awaiting Funds" : "Live Tracker"}
                </span>
              </div>
            </div>

            <div className="bg-natural-50 border border-natural-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-natural-600 block mb-1">
                  System Cash Balance
                </span>
                <span className="text-3xl font-serif font-bold text-natural-900 font-mono">
                  {formatNaira(liveBalance)}
                </span>
              </div>
              <div className="text-xs text-natural-600 font-bold space-y-1 sm:text-right">
                <div>Approved Capital: {formatNaira(totalApprovedCapital)}</div>
                <div>Stage Deductions: {formatNaira(stageExpensesTotal + activePlasticCost + activeTransportCost + activeLaborCost + activeEquipCost)}</div>
              </div>
            </div>

            {/* Micro cash ledger receipts/transitions */}
            <div className="space-y-3">
              <div className="pb-2 border-b border-natural-200 text-[10px] font-bold uppercase tracking-widest text-natural-500">
                Cash Flow Log & Impact
              </div>
              
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                <div className="flex justify-between items-center text-xs p-2.5 bg-green-50/50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-bold text-natural-900">Approved Investor Capital</span>
                  </div>
                  <span className="font-mono text-green-700 font-bold">+{formatNaira(totalApprovedCapital)}</span>
                </div>

                {isPlasticDeducted && (
                  <div className="flex justify-between items-center text-xs p-2.5 bg-red-50/50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="font-bold text-natural-900">Plastic Sourcing & Buyout (Collation Stage)</span>
                    </div>
                    <span className="font-mono text-red-700 font-bold">-{formatNaira(plasticPurchaseCost)}</span>
                  </div>
                )}

                {isTransportCompleted && (
                  <>
                    <div className="flex justify-between items-center text-xs p-2.5 bg-red-50/50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="font-bold text-natural-900">Transport Logistics (Transport Stage)</span>
                      </div>
                      <span className="font-mono text-red-700 font-bold">-{formatNaira(cycle.expenses.transportCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2.5 bg-red-50/50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="font-bold text-natural-900">Labor Sorter Deployment</span>
                      </div>
                      <span className="font-mono text-red-700 font-bold">-{formatNaira(cycle.expenses.laborCost)}</span>
                    </div>
                  </>
                )}

                {(cycle.expensesList || []).map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center text-xs p-2.5 bg-amber-50/20 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-natural-900">{exp.name} <span className="text-[9px] uppercase tracking-widest text-amber-800 font-bold">({exp.stage.replace("_", " ")})</span></span>
                    </div>
                    <span className="font-mono text-amber-700 font-bold">-{formatNaira(exp.amount)}</span>
                  </div>
                ))}

                {isRevenueAdded && (
                  <div className="flex justify-between items-center text-xs p-2.5 bg-green-50/50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-bold text-natural-900">Client Revenue Remittance (Payment Confirmed)</span>
                    </div>
                    <span className="font-mono text-green-700 font-bold">+{formatNaira(cycle.revenue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Stage specific expense card (Admin only) */}
          {role === "admin" && cycle.status !== "completed" && (
            <div className="bg-white border border-natural-300 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Log Stage Expense & Adjustment
              </h3>
              <p className="text-xs text-natural-600 mb-4 font-bold">
                Incur addition/misc. expenses under the active <span className="text-primary italic">"{cycle.status.replace("_", " ")}"</span> stage immediately.
              </p>
              
              <form onSubmit={handleAddStageExpense} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken sack repair"
                  value={stageExpenseName}
                  onChange={(e) => setStageExpenseName(e.target.value)}
                  className="flex-1 rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                />
                <input
                  type="number"
                  required
                  placeholder="Amount (₦)"
                  value={stageExpenseAmount}
                  onChange={(e) => setStageExpenseAmount(e.target.value)}
                  className="w-full sm:w-32 rounded-xl border-natural-300 border px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-bold text-natural-900 bg-white"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shrink-0"
                >
                  Record Expense
                </button>
              </form>
            </div>
          )}

          {/* Metrics & Inputs list */}
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
                <span className="font-bold text-slate-400">
                  {formatNaira(cycle.expenses.equipmentCostAllocated)} (Not deducted yet)
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

          {cycle.fundingItems && cycle.fundingItems.length > 0 && (
            <div className="bg-white border border-natural-300 rounded-[2rem] shadow-sm overflow-hidden p-5 md:p-6">
              <div className="pb-4 border-b border-natural-300 text-[10px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">
                Planned Funding Allocation Breakdown
              </div>
              <div className="space-y-3">
                {cycle.fundingItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-natural-100 last:border-0 last:pb-0 flex-wrap gap-2">
                    <div>
                      <div className="font-bold text-natural-900 text-sm flex items-center gap-2">
                        {item.name}
                        {item.isEquipment && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Equipment Asset
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-natural-500 font-medium mt-0.5">
                        {item.isEquipment ? "Capital Equipment (CAPEX)" : "Operating Capital (OPEX)"}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-natural-800 text-sm">{formatNaira(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Investment & Funding Operations */}
          <div className="bg-white border border-natural-300 rounded-[2rem] p-5 md:p-6 shadow-sm">
            <div className="pb-4 border-b border-natural-300 text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Capital & Funding Round
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-natural-600 mb-1">
                  <span>Funds Verified</span>
                  <span className="font-mono">{formatNaira(totalApprovedCapital)} / {formatNaira(cycle.targetFundNeeded)}</span>
                </div>
                <div className="w-full bg-natural-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalApprovedCapital / (cycle.targetFundNeeded || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-natural-500 font-bold uppercase mt-1">
                  {((totalApprovedCapital / (cycle.targetFundNeeded || 1)) * 100).toFixed(1)}% Funded Proportional Target
                </p>
              </div>

              {/* Add pre-approved investor manual form */}
              {role === "admin" && (
                <div className="pt-4 border-t border-natural-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-natural-600">
                    Add Pre-Approved Investor
                  </p>
                  <form onSubmit={handleAddInvestor} className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Investor Full Name"
                      value={newInvestorName}
                      onChange={(e) => setNewInvestorName(e.target.value)}
                      className="w-full rounded-lg border-natural-300 border px-3 py-1.5 text-xs font-bold text-natural-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Amount (₦)"
                      value={newInvestorAmount}
                      onChange={(e) => setNewInvestorAmount(e.target.value)}
                      className="w-full rounded-lg border-natural-300 border px-3 py-1.5 text-xs font-bold text-natural-900 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[10px] font-bold py-2 rounded-lg transition uppercase tracking-wider"
                    >
                      Approve & Log Commitment
                    </button>
                  </form>
                </div>
              )}

              {/* Investor commitments lists */}
              <div className="pt-4 border-t border-natural-100">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-natural-600">
                  Linked Contributions ({cycleInvestors.length})
                </p>

                {cycleInvestors.length === 0 ? (
                  <p className="text-xs text-natural-500 italic">No investor commitments logged yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cycleInvestors.map((inv) => (
                      <div key={inv.id} className="p-3 bg-natural-50 border border-natural-200 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-natural-900">{inv.name}</div>
                            <div className="text-[10px] text-natural-500 font-bold mt-0.5">{new Date(inv.date).toLocaleDateString()}</div>
                          </div>
                          <span 
                            className={cn(
                              "inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                              inv.approved 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-amber-100 text-amber-800 border border-amber-200 anim-pulse"
                            )}
                          >
                            {inv.approved ? "Approved" : "Awaiting Info"}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center flex-wrap gap-2">
                          <span className="font-mono text-xs font-bold text-natural-800">{formatNaira(inv.amount)}</span>
                          
                          {role === "admin" && !inv.approved && (
                            <button
                              onClick={() => handleApproveInvestor(inv.id)}
                              className="text-[9px] font-bold uppercase bg-primary text-white border border-primary hover:bg-primary-dark px-2.5 py-1 rounded-md transition tracking-wider"
                            >
                              Approve Transfer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

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

      {showDeleteWarn && (
        <div className="fixed inset-0 bg-natural-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-natural-300 rounded-[2.5rem] shadow-xl max-w-md w-full p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-bold uppercase tracking-widest leading-none">
                Confirm Soft Deletion
              </h4>
            </div>
            <p className="text-xs text-natural-600 font-bold leading-relaxed">
              Are you sure you want to delete this campaign cycle? 
              This will transition the cycle out of the general overview and place it inside the Cycles Trash Bin, where you can restore it anytime without data loss.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  deleteCycle(cycle.id);
                  setShowDeleteWarn(false);
                  navigate("/cycles");
                }}
                className="flex-1 bg-red-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full hover:bg-red-700 transition text-center"
              >
                Delete to Trash
              </button>
              <button
                onClick={() => setShowDeleteWarn(false)}
                className="flex-1 bg-[#f4f4f4] border border-natural-300 text-natural-800 font-bold text-xs uppercase tracking-wider py-3 rounded-full hover:bg-natural-200 transition text-center"
              >
                Cancel Deletion
              </button>
            </div>
          </div>
        </div>
      )}
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

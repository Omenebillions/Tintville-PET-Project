import React from "react";
import { FileText, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

export default function Proposal() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-natural-300 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-natural-900 tracking-tight">
            Investment Proposal
          </h1>
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-primary">
            Tintville Nigeria Enterprise
          </h2>
          <p className="text-sm md:text-base text-natural-600 font-medium">PET Plastic Recycling</p>
          <p className="text-sm md:text-base text-natural-600 font-medium">Badore Ajah, Lagos State</p>
        </div>
      </div>

      {/* The Opportunity */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-6">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
          <TrendingUp className="w-5 h-5" /> The Opportunity
        </h3>
        <p className="text-natural-800 leading-relaxed">
          Nigeria generates millions of PET plastic bottles daily. Less than 15% gets recycled. 
          The gap between what collectors earn and what processors pay is where this business lives 
          — and the numbers are real and validated on the ground.
        </p>
        <div className="bg-natural-50 p-6 rounded-2xl border border-natural-200">
          <p className="text-sm font-bold text-natural-900 mb-4">I have spent weeks in Lagos confirming every part of this supply chain:</p>
          <ul className="space-y-3">
            {[
              "Confirmed processor buyer with active purchase price",
              "Confirmed collectors already gathering stock",
              "Confirmed transport route and cost",
              "Custom baling equipment being fabricated locally"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-natural-700">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-natural-900 font-bold italic border-l-4 border-primary pl-4">
          This is not an idea. The supply chain is already moving.
        </p>
      </div>

      {/* The Business Model */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
          The Business Model
        </h3>
        <p className="text-natural-800 leading-relaxed">
          We collect, sort, press, and sell clean PET plastic bottles to certified recycling processors in Lagos.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Buying price", value: "₦300/kg", sub: "from collectors" },
            { label: "Selling price", value: "₦510/kg", sub: "to processor" },
            { label: "Gross margin", value: "₦210/kg", sub: "" },
            { label: "Transport", value: "₦250k/trip", sub: "fixed cost" },
            { label: "Max load", value: "3,500kg", sub: "per trip (baled)" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-natural-50 p-4 rounded-2xl border border-natural-200 flex flex-col justify-center text-center">
              <div className="text-[10px] font-bold text-natural-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-lg font-bold text-natural-900">{stat.value}</div>
              <div className="text-[10px] text-natural-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-natural-900">Exact Profit Per Delivery Cycle</h4>
          <div className="overflow-x-auto rounded-2xl border border-natural-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-natural-100 text-natural-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Load</th>
                  <th className="px-6 py-4">Gross Revenue</th>
                  <th className="px-6 py-4">Plastic Cost</th>
                  <th className="px-6 py-4">Transport</th>
                  <th className="px-6 py-4 text-green-700 bg-green-50">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-200 bg-white">
                {[
                  ["1,500kg", "₦765,000", "₦450,000", "₦250,000", "₦65,000"],
                  ["2,000kg", "₦1,020,000", "₦600,000", "₦250,000", "₦170,000"],
                  ["2,500kg", "₦1,275,000", "₦750,000", "₦250,000", "₦275,000"],
                  ["3,000kg", "₦1,530,000", "₦900,000", "₦250,000", "₦380,000"],
                  ["3,500kg", "₦1,785,000", "₦1,050,000", "₦250,000", "₦485,000"]
                ].map((row, idx) => (
                  <tr key={idx} className={idx === 4 ? "font-bold bg-green-50/30" : ""}>
                    <td className="px-6 py-4 text-natural-900">{row[0]}</td>
                    <td className="px-6 py-4">{row[1]}</td>
                    <td className="px-6 py-4 text-natural-600">{row[2]}</td>
                    <td className="px-6 py-4 text-natural-600">{row[3]}</td>
                    <td className="px-6 py-4 font-bold text-green-700 bg-green-50/50">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-bold text-center text-natural-700 italic">The goal is 3,500kg per trip — maximum load, maximum profit.</p>
        </div>
      </div>

      {/* Capital Needed */}
      <div className="bg-natural-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-700 pb-4">
          Total Capital Needed: ₦2,000,000
        </h3>
        <p className="text-natural-400 text-sm italic">Every naira accounted for:</p>
        
        <div className="overflow-x-auto rounded-2xl border border-natural-700 bg-natural-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-natural-950 text-natural-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-700">
              {[
                ["Hi-Lift jack baler fabrication", "₦160,000"],
                ["Digital hanging scale 300kg", "₦28,000"],
                ["PPE, sacks, ropes, tools", "₦50,000"],
                ["Working capital — buy first load", "₦875,000"],
                ["Transport — first 3 trips", "₦750,000"],
                ["Buffer / contingency", "₦137,000"]
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">{row[0]}</td>
                  <td className="px-6 py-4 text-right font-mono">{row[1]}</td>
                </tr>
              ))}
              <tr className="bg-primary/20">
                <td className="px-6 py-4 font-bold text-primary">Total</td>
                <td className="px-6 py-4 text-right font-bold text-primary font-mono text-lg">₦2,000,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cycle Projections & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
            Cycle Projections
          </h3>
          <p className="text-xs text-natural-600 leading-relaxed border-l-2 border-natural-300 pl-3 italic">
            Payment is made per delivery cycle — not monthly. A cycle is complete when a full truck load is delivered and payment received from buyer. If a cycle does not happen in a given month due to supply buildup or logistics — no payment is due. This protects both parties.
          </p>
          <div className="space-y-4">
            <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
              <h4 className="font-bold text-natural-900 text-sm">Cycle 1</h4>
              <p className="text-xs text-natural-600 mt-1 mb-2">First delivery. 1,500kg while collectors scale up and baler is commissioned.</p>
              <div className="text-sm font-bold text-green-700">Gross: ₦765k | Profit: ₦65k</div>
            </div>
            <div className="bg-natural-50 p-4 rounded-2xl border border-natural-200">
              <h4 className="font-bold text-natural-900 text-sm">Cycle 2–3</h4>
              <p className="text-xs text-natural-600 mt-1 mb-2">Baler fully operational. Loads increase to 2,500–3,000kg.</p>
              <div className="text-sm font-bold text-green-700">Gross: ₦1.27m–₦1.53m | Profit: ₦275k–₦380k</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
              <h4 className="font-bold text-primary text-sm">Cycle 4–6 & Onwards</h4>
              <p className="text-xs text-natural-700 mt-1 mb-2">Full 3,500kg loads consistently. Two full trips per cycle period eventually.</p>
              <div className="text-sm font-bold text-green-700">Monthly Profit Potential: ₦760k–₦970k</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-6">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#EF4444] border-b border-natural-200 pb-4">
            <ShieldCheck className="w-5 h-5" /> Risk Management
          </h3>
          <ul className="space-y-5">
            {[
              { title: "Buyer price fluctuates", desc: "Actively building relationships with multiple buyers so we are never held hostage by one processor." },
              { title: "Collector supply inconsistency", desc: "Minimum three active collectors signed up before first trip. If one slows, others keep moving." },
              { title: "Transport cost increases", desc: "Negotiated per trip. As volume grows we explore buying a fairly used truck outright to jump margins." },
              { title: "Quality rejection at processor", desc: "Strict quality control. Collectors trained on clear PET only. Contaminated material rejected at source." },
              { title: "Slow collection months", desc: "Payment is per cycle not per month. No trip — no pressure. Business only pays when it earns." }
            ].map((risk, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-bold text-natural-900 block mb-1">{risk.title}</span>
                <span className="text-natural-600">{risk.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Partnership Structure */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
          Partnership Structure
        </h3>

        <div className="space-y-8">
          <div>
            <h4 className="font-bold text-lg text-natural-900 mb-4 bg-natural-100 inline-block px-4 py-1 rounded-full">Option 1 — Profit Share Per Trip (Recommended)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Investment</div>
                <div className="text-base font-bold text-natural-900">₦2,000,000</div>
              </div>
              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Investor Share</div>
                <div className="text-base font-bold text-primary">40% of net</div>
              </div>
               <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Repayment Target</div>
                <div className="text-base font-bold text-green-600">₦3,200,000</div>
              </div>
               <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">After Target</div>
                <div className="text-sm font-bold text-natural-900">Clean exit</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-natural-200 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-natural-100 text-natural-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Load</th>
                    <th className="px-6 py-3">Net Profit</th>
                    <th className="px-6 py-3 text-primary bg-primary/5">Investor 40%</th>
                    <th className="px-6 py-3">Operator 60%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-natural-200">
                  <tr className="bg-white">
                    <td className="px-6 py-3 font-medium">1,500kg</td>
                    <td className="px-6 py-3">₦65,000</td>
                    <td className="px-6 py-3 font-bold text-primary bg-primary/5">₦26,000</td>
                    <td className="px-6 py-3">₦39,000</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 font-medium">2,500kg</td>
                    <td className="px-6 py-3">₦275,000</td>
                    <td className="px-6 py-3 font-bold text-primary bg-primary/5">₦110,000</td>
                    <td className="px-6 py-3">₦165,000</td>
                  </tr>
                  <tr className="bg-primary/5 font-bold">
                    <td className="px-6 py-3">3,500kg</td>
                    <td className="px-6 py-3">₦485,000</td>
                    <td className="px-6 py-3 text-primary bg-primary/10">₦194,000</td>
                    <td className="px-6 py-3">₦291,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm font-bold text-natural-800">
              At 2 full trips per month investor earns: <span className="text-green-600">₦388,000/month</span>. 
              Full ₦3.2M recovered in approximately: 8–9 trips.
            </p>
          </div>
          
          <hr className="border-natural-200" />
          
          <div>
            <h4 className="font-bold text-lg text-natural-900 mb-4 bg-natural-100 inline-block px-4 py-1 rounded-full">Option 2 — 50/50 Equity Per Trip with Buyout</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Investment</div>
                <div className="text-base font-bold text-natural-900">₦2,000,000 cash</div>
              </div>
              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">My Contribution</div>
                <div className="text-base font-bold text-natural-900">₦2,000,000 sweat</div>
              </div>
              <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Ownership</div>
                <div className="text-base font-bold text-primary">50/50</div>
              </div>
               <div className="bg-natural-50 p-4 rounded-xl border border-natural-200">
                <div className="text-[10px] uppercase font-bold text-natural-500">Mgt Fee</div>
                <div className="text-sm font-bold text-natural-900">₦80k / cycle</div>
              </div>
            </div>

            <div className="bg-natural-50 p-6 rounded-2xl border border-natural-200 mb-4">
               <h5 className="text-xs font-bold uppercase tracking-widest text-natural-700 mb-3">Earnings per full 3,500kg trip</h5>
               <ul className="space-y-2 text-sm text-natural-800">
                 <li className="flex justify-between"><span>Net profit:</span> <strong>₦485,000</strong></li>
                 <li className="flex justify-between"><span>Less management fee:</span> <span className="text-natural-600">-₦80,000</span></li>
                 <li className="flex justify-between border-t border-natural-300 pt-2"><span>Distributable:</span> <strong>₦405,000</strong></li>
                 <li className="flex justify-between mt-2"><span>Investor 50%:</span> <span className="text-primary font-bold">₦202,500</span></li>
                 <li className="flex justify-between"><span>Operator 50% + Mgt Fee:</span> <span>₦282,500</span></li>
               </ul>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-2">
               <h5 className="text-sm font-bold text-primary">Buyout at Cycle 20 or Month 12:</h5>
               <p className="text-sm text-natural-800">I buy your 50% for ₦500,000.</p>
               <ul className="text-sm space-y-1 mt-2">
                 <li>20 cycles × ₦202,500 = ₦4,050,000</li>
                 <li>Buyout = ₦500,000</li>
                 <li className="font-bold text-green-700 text-lg mt-2 pt-2 border-t border-primary/20">
                   Total: ₦4,550,000 on ₦2M (127% return)
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Comparisons & People */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
            Why This Beats Alternatives
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-natural-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-natural-100 text-natural-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Investment</th>
                  <th className="px-6 py-3 text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-200 bg-white">
                <tr><td className="px-6 py-3">Bank savings</td><td className="px-6 py-3 text-right">8–12% annually</td></tr>
                <tr><td className="px-6 py-3">Treasury bills</td><td className="px-6 py-3 text-right">18–22% annually</td></tr>
                <tr><td className="px-6 py-3">Real estate Lagos</td><td className="px-6 py-3 text-right">15–25% annually</td></tr>
                <tr className="bg-green-50 font-bold"><td className="px-6 py-3 text-green-900">This Business</td><td className="px-6 py-3 text-right text-green-700">127–160% in 12 months</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-natural-700 italic border-l-4 border-primary pl-4">
            Unlike every option above this is a physical business with real buyers, real collectors, and an operator fully committed on the ground every day.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4">
            Who Is Running This
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-serif font-bold text-natural-900">Martin</h4>
              <p className="text-sm text-primary font-bold uppercase tracking-widest">Founder, Tintville Nigeria Enterprise</p>
            </div>
            <ul className="space-y-2 text-sm text-natural-700">
              <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-natural-400"></span> BSc Environmental Management</li>
              <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-natural-400"></span> ISC² Cybersecurity Certification</li>
              <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-natural-400"></span> Full-stack developer and serial entrepreneur</li>
              <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-natural-400"></span> Multiple CAC registered businesses</li>
            </ul>
            <div className="bg-natural-50 p-4 rounded-xl border border-natural-200 text-xs text-natural-800 italic">
              "Weeks of ground-level market research validating every figure in this proposal. Every number here has been checked against real Lagos market prices. Nothing is theoretical."
            </div>
          </div>
        </div>
      </div>

      {/* Protections & Next Steps */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-300 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4 mb-4">
              <ShieldCheck className="w-5 h-5" /> Investor Protections
            </h3>
            <ul className="space-y-3">
              {[
                "Written partnership agreement signed before any funds released",
                "Funds released in tranches tied to milestones — not all at once",
                "Gross revenue and cost receipts shared after every delivery cycle",
                "Business fully registered under CAC — legally accountable",
                "Migrating to Martom Nigeria Limited (RC) within 6 months",
                "Investor has right to independent weight verification at processor if requested"
              ].map((item, idx) => (
                 <li key={idx} className="flex items-start gap-3 text-sm text-natural-700">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-natural-200 pb-4 mb-4">
              What Happens Next
            </h3>
            <ol className="space-y-4">
               {[
                "We meet or call to discuss and agree terms",
                "Partnership agreement drafted and signed by both parties",
                "Funds released in two tranches — equipment first, working capital second",
                "First delivery within 3–4 weeks of funding",
                "First investor payment issued after first completed delivery cycle"
              ].map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-natural-800 font-medium">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">{idx + 1}</span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Footer Closing */}
      <div className="bg-primary text-white p-8 md:p-12 rounded-[2.5rem] shadow-sm text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <p className="text-lg md:text-xl font-serif italic leading-relaxed">
            "Lagos discards millions in plastic value every single day. We are simply collecting it, pressing it, and converting it to cash. The buyer is real. The collectors are ready. The equipment is being built. All that is missing is capital to move."
          </p>
          <div className="h-px bg-white/20 w-1/2 mx-auto" />
          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-1">Tintville Nigeria Enterprise</h4>
            <p className="text-white/70 text-xs">Badore Ajah, Lagos State | CAC Registered</p>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mt-4">Confidential — For Discussion Purposes Only</p>
          </div>
        </div>
      </div>

    </div>
  );
}

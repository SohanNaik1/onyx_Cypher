"use client";

import React, { useState } from "react";

interface ProblemItem {
  id: string;
  sku: string;
  itemName: string;
  location: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  evidence: {
    currentStock: number;
    dailyDemand: number;
    daysRemaining: number;
    supplierLeadTime: number;
    surplusLocation?: string;
    surplusStock?: number;
  };
  options: {
    title: string;
    description: string;
    costImpact: string;
    timeToFulfill: string;
    recommended: boolean;
  }[];
  actionDraft: {
    type: "TRANSFER REQUEST" | "EXPEDITE PO" | "CLEARANCE REBATE";
    referenceId: string;
    details: string;
    estimatedCost: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const INITIAL_PROBLEMS: ProblemItem[] = [
  {
    id: "PROB-01",
    sku: "HF-4201",
    itemName: "Heavy Hydraulic Filter 42mm",
    location: "Gokak Store",
    urgency: "HIGH",
    summary: "Stock depletion imminent. Local stock will run out in 2 days, but default supplier needs 7 days.",
    evidence: {
      currentStock: 8,
      dailyDemand: 4,
      daysRemaining: 2,
      supplierLeadTime: 7,
      surplusLocation: "Belgaum Depot",
      surplusStock: 48,
    },
    options: [
      {
        title: "Inter-Store Transfer from Belgaum",
        description: "Move 20 units from Belgaum depot where stock moves slowly (0.5 units/day). Arrives tomorrow.",
        costImpact: "Rs. 350 transit cost",
        timeToFulfill: "1 Day",
        recommended: true,
      },
      {
        title: "Emergency Order from Apex FastSupplies",
        description: "Express supplier can dispatch in 3 days but charges an extra 18% urgent premium.",
        costImpact: "Rs. 2,100 additional cost",
        timeToFulfill: "3 Days",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "TRANSFER REQUEST",
      referenceId: "TR-2026-081",
      details: "Transfer 20 units of HF-4201 from Belgaum Depot -> Gokak Store. Carrier: Hubli Regional Van.",
      estimatedCost: "Rs. 350",
    },
    status: "PENDING",
  },
  {
    id: "PROB-02",
    sku: "SK-9940",
    itemName: "Shaft Seal Kit 40mm",
    location: "Hubli Depot",
    urgency: "HIGH",
    summary: "PO #4412 from Kirloskar Spares is 4 days overdue. Harvest service schedule at risk.",
    evidence: {
      currentStock: 3,
      dailyDemand: 2.5,
      daysRemaining: 1.2,
      supplierLeadTime: 10,
    },
    options: [
      {
        title: "Air Expedite Existing PO #4412",
        description: "Supplier has units packed. Authorize Rs. 600 express transit surcharge for delivery tomorrow.",
        costImpact: "Rs. 600 surcharge",
        timeToFulfill: "24 Hours",
        recommended: true,
      },
      {
        title: "Cancel & Reorder Locally",
        description: "Purchase from secondary local supplier at non-contract retail rate.",
        costImpact: "Rs. 3,400 extra cost",
        timeToFulfill: "2 Days",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "EXPEDITE PO",
      referenceId: "PO-4412-EXP",
      details: "Urgent air courier authorization for PO #4412. Supplier: Kirloskar Spares (50 sets).",
      estimatedCost: "Rs. 600",
    },
    status: "PENDING",
  },
  {
    id: "PROB-03",
    sku: "OR-1108",
    itemName: "Nitrile O-Ring Multi-Box",
    location: "Belgaum Depot",
    urgency: "MEDIUM",
    summary: "Excess inventory tying up working capital. 180 boxes sitting idle with zero sales in 75 days.",
    evidence: {
      currentStock: 180,
      dailyDemand: 0.1,
      daysRemaining: 1800,
      supplierLeadTime: 5,
    },
    options: [
      {
        title: "15% Workshop Clearance Bundle",
        description: "Release a bulk maintenance discount for registered North Karnataka workshops.",
        costImpact: "15% margin deduction",
        timeToFulfill: "Immediate",
        recommended: true,
      },
      {
        title: "Hold at standard MRP",
        description: "Leave stock on shelves. Inventory holding fee costs Rs. 800/month.",
        costImpact: "Rs. 800/mo holding loss",
        timeToFulfill: "N/A",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "CLEARANCE REBATE",
      referenceId: "DISC-OR-2026",
      details: "Issue 15% promotional clearance code on OR-1108 for Belgaum & Dharwad garage accounts.",
      estimatedCost: "Rs. 0 cash outlay",
    },
    status: "PENDING",
  },
];

export default function RameshOpsDesk() {
  const [problems, setProblems] = useState<ProblemItem[]>(INITIAL_PROBLEMS);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PROCESSED">("ALL");

  const handleDecision = (id: string, decision: "APPROVED" | "REJECTED") => {
    setProblems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
  };

  const filtered = problems.filter((item) => {
    if (activeTab === "PENDING") return item.status === "PENDING";
    if (activeTab === "PROCESSED") return item.status !== "PENDING";
    return true;
  });

  const pendingCount = problems.filter((p) => p.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400">
            KS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Kaveri Spares &amp; Hydraulics
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Agent Loop Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Purchasing Desk &bull; Ramesh Kulkarni &bull; North Karnataka (6 Stores, 2 Depots)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Pending Approvals</span>
            <span className="text-sm font-bold text-amber-400">
              {pendingCount} Actions Need Approval
            </span>
          </div>
          <button
            onClick={() => setProblems(INITIAL_PROBLEMS)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Reset Test Data
          </button>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 mb-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Morning Ingestion Complete &bull; 8:30 AM
            </span>
            <span className="text-xs font-mono text-slate-400">
              Processed: Products &bull; Inventory &bull; Sales &bull; Suppliers &bull; Open POs
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            3 High-Priority Issues Flagged for Today
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            The AI agent cross-referenced inventory rates against supplier lead times and store transfers.
            Review the evidence, trade-offs, and draft action for each scenario below before approving execution.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Stores Monitored</span>
              <span className="text-base font-bold text-white">6 Locations</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Urgent Stockouts</span>
              <span className="text-base font-bold text-red-400">Gokak (2 Days Left)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Overdue Deliveries</span>
              <span className="text-base font-bold text-amber-400">1 PO Delayed</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Excess Stock Tying Cash</span>
              <span className="text-base font-bold text-slate-300">Belgaum Depot</span>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(["ALL", "PENDING", "PROCESSED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  activeTab === tab
                    ? "bg-slate-800 text-white border-slate-600"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} decision cards
          </span>
        </div>

        <div className="space-y-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all p-6 ${
                item.status === "APPROVED"
                  ? "border-emerald-800/60 bg-emerald-950/10"
                  : item.status === "REJECTED"
                  ? "border-red-900/40 bg-red-950/10 opacity-60"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.urgency === "HIGH"
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {item.urgency} Urgency
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {item.id} &bull; {item.location}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : item.status === "REJECTED"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                {item.itemName} ({item.sku})
              </h3>
              <p className="text-sm text-slate-300 mb-4">{item.summary}</p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  Agent Evidence &amp; Numbers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Current Stock:</span>
                    <strong className="text-slate-200">{item.evidence.currentStock} units</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Daily Demand:</span>
                    <strong className="text-slate-200">{item.evidence.dailyDemand} / day</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Stock Runout:</span>
                    <strong className="text-red-400 font-bold">{item.evidence.daysRemaining} days</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lead Time:</span>
                    <strong className="text-slate-200">{item.evidence.supplierLeadTime} days</strong>
                  </div>
                </div>
                {item.evidence.surplusLocation && (
                  <p className="text-xs text-emerald-400 mt-3 pt-2 border-t border-slate-800/60 font-mono">
                    &bull; Surplus identified: {item.evidence.surplusLocation} holds {item.evidence.surplusStock} units moving slowly.
                  </p>
                )}
              </div>

              <div className="mb-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Trade-off Comparison:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        opt.recommended
                          ? "border-blue-500/40 bg-blue-950/20 text-blue-200"
                          : "border-slate-800 bg-slate-950/60 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1.5">
                        <span className="text-white">{opt.title}</span>
                        {opt.recommended && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mb-2 leading-relaxed">{opt.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                        <span>Cost: {opt.costImpact}</span>
                        <span>Fulfill: {opt.timeToFulfill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.actionDraft.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {item.actionDraft.referenceId}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{item.actionDraft.details}</p>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Estimated Cost Impact: <strong>{item.actionDraft.estimatedCost}</strong>
                  </span>
                </div>

                {item.status === "PENDING" ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(item.id, "REJECTED")}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, "APPROVED")}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition active:scale-95"
                    >
                      Approve &amp; Dispatch
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Decision recorded by Ramesh Kulkarni.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Cypher 2026 &bull; KD&apos;s Garage Challenge 01: Kaveri Spares &amp; Hydraulics Agent
      </footer>
    </div>
  );
}
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
    savingsVsAlternative: string;
    carrierOrVendor: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ChatMessage {
  sender: "user" | "agent";
  text: string;
  timestamp: string;
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
        costImpact: "₹350 transit cost",
        timeToFulfill: "1 Day",
        recommended: true,
      },
      {
        title: "Emergency Order from Apex FastSupplies",
        description: "Express supplier can dispatch in 3 days but charges an extra 18% urgent premium.",
        costImpact: "₹2,100 additional cost",
        timeToFulfill: "3 Days",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "TRANSFER REQUEST",
      referenceId: "TR-2026-081",
      details: "Transfer 20 units of HF-4201 from Belgaum Depot -> Gokak Store.",
      estimatedCost: "₹350",
      savingsVsAlternative: "₹1,750 vs Emergency Supplier",
      carrierOrVendor: "Hubli Regional Logistics Van #KA-22",
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
        description: "Supplier has units packed. Authorize ₹600 express transit surcharge for delivery tomorrow.",
        costImpact: "₹600 surcharge",
        timeToFulfill: "24 Hours",
        recommended: true,
      },
      {
        title: "Cancel & Reorder Locally",
        description: "Purchase from secondary local supplier at non-contract retail rate.",
        costImpact: "₹3,400 extra cost",
        timeToFulfill: "2 Days",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "EXPEDITE PO",
      referenceId: "PO-4412-EXP",
      details: "Urgent air courier authorization for PO #4412 (50 sets).",
      estimatedCost: "₹600",
      savingsVsAlternative: "₹2,800 vs Spot Reorder",
      carrierOrVendor: "Blue Dart Air Priority Cargo",
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
        description: "Leave stock on shelves. Inventory holding fee costs ₹800/month.",
        costImpact: "₹800/mo holding loss",
        timeToFulfill: "N/A",
        recommended: false,
      },
    ],
    actionDraft: {
      type: "CLEARANCE REBATE",
      referenceId: "DISC-OR-2026",
      details: "Issue 15% promotional clearance code on OR-1108 across Belgaum garages.",
      estimatedCost: "₹0 cash outlay",
      savingsVsAlternative: "₹2,400 unlocked capital",
      carrierOrVendor: "Direct Workshop Portal Notification",
    },
    status: "PENDING",
  },
];

const RAW_SPREADSHEET_DATA = {
  inventory: [
    { sku: "HF-4201", store: "Gokak Store", onHand: 8, reserved: 2, reorderPoint: 20 },
    { sku: "HF-4201", store: "Belgaum Depot", onHand: 48, reserved: 0, reorderPoint: 15 },
    { sku: "SK-9940", store: "Hubli Depot", onHand: 3, reserved: 3, reorderPoint: 25 },
    { sku: "OR-1108", store: "Belgaum Depot", onHand: 180, reserved: 0, reorderPoint: 30 },
  ],
  sales: [
    { sku: "HF-4201", store: "Gokak Store", last7Days: 28, avgDaily: 4.0, trend: "+15%" },
    { sku: "HF-4201", store: "Belgaum Depot", last7Days: 3, avgDaily: 0.4, trend: "-40%" },
    { sku: "SK-9940", store: "Hubli Depot", last7Days: 18, avgDaily: 2.5, trend: "+20%" },
    { sku: "OR-1108", store: "Belgaum Depot", last7Days: 0, avgDaily: 0.0, trend: "0%" },
  ],
  suppliers: [
    { name: "Kirloskar Spares", sku: "SK-9940", unitCost: "₹180", standardLead: "10 Days", expressLead: "1 Day (Air)" },
    { name: "Apex FastSupplies", sku: "HF-4201", unitCost: "₹420", standardLead: "7 Days", expressLead: "3 Days (+18%)" },
    { name: "Deccan Hydraulics", sku: "HF-4201", unitCost: "₹350", standardLead: "7 Days", expressLead: "None" },
  ],
  openPOs: [
    { poNumber: "PO-4412", vendor: "Kirloskar Spares", sku: "SK-9940", qty: 50, expectedDate: "3 Days Ago", status: "OVERDUE" },
    { poNumber: "PO-4420", vendor: "Deccan Hydraulics", sku: "HF-4201", qty: 40, expectedDate: "Oct 15", status: "IN_TRANSIT" },
  ],
  storeMessages: [
    { time: "06:45 AM", store: "Gokak Branch", message: "Urgent: Tractor harvest servicing starting Monday. Only 8 filters HF-4201 left!" },
    { time: "07:10 AM", store: "Belgaum Depot", message: "Warehouse space tight in Bay 3 due to unsold nitrile O-ring boxes." },
    { time: "07:30 AM", store: "Hubli Depot", message: "Workshop customer waiting on seal kits from PO #4412." },
  ],
};

export default function RameshOpsDesk() {
  const [problems, setProblems] = useState<ProblemItem[]>(INITIAL_PROBLEMS);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PROCESSED">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<"inventory" | "sales" | "suppliers" | "openPOs" | "storeMessages">("inventory");
  const [activeReceipt, setActiveReceipt] = useState<ProblemItem | null>(null);

  // Chat / Reasoning Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "agent",
      text: "Namaskara Ramesh! I've loaded today's 5 feeds across our 6 North Karnataka stores. Ask me anything about stockout timelines, vendor pricing, or transfer trade-offs.",
      timestamp: "08:31 AM",
    },
  ]);

  const handleDecision = (id: string, decision: "APPROVED" | "REJECTED") => {
    setProblems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    if (decision === "APPROVED") {
      const approvedItem = problems.find((p) => p.id === id);
      if (approvedItem) {
        setActiveReceipt({ ...approvedItem, status: "APPROVED" });
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const userMsg: ChatMessage = {
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Simulate Agent Domain Reasoning based on the 5 spreadsheets
    setTimeout(() => {
      let reply = "I analyzed our 5 spreadsheets: ";
      const lower = query.toLowerCase();

      if (lower.includes("gokak") || lower.includes("filter") || lower.includes("hf-4201")) {
        reply = "Gokak burns 4.0 filters/day with 8 remaining (run-out in 2 days). Belgaum has 48 units moving at only 0.4/day. Transferring 20 units leaves Belgaum with 28 units (70 days of cover) and saves ₹1,750 compared to Apex FastSupplies!";
      } else if (lower.includes("hubli") || lower.includes("po") || lower.includes("kirloskar") || lower.includes("seal")) {
        reply = "PO #4412 with Kirloskar Spares is 4 days overdue. Hubli Depot only has 3 units left with 3 reserved for harvest servicing. Paying ₹600 air freight ensures delivery tomorrow noon instead of waiting 10 days for a standard restock.";
      } else if (lower.includes("belgaum") || lower.includes("o-ring") || lower.includes("clearance")) {
        reply = "Belgaum has 180 boxes of OR-1108 tying up ₹2,400 with zero sales in 75 days. Holding costs cost us ₹800/month. Offering a 15% discount to local agricultural mechanics turns this idle stock into liquid capital immediately.";
      } else {
        reply = `Cross-referencing North Karnataka inventory: All 6 stores and 2 depots are indexed. For ${query}, inter-store transit via Hubli regional logistics is faster (24h) and 60% cheaper than emergency spot-market reorders.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 600);
  };

  const filtered = problems.filter((item) => {
    if (activeTab === "PENDING") return item.status === "PENDING";
    if (activeTab === "PROCESSED") return item.status !== "PENDING";
    return true;
  });

  const pendingCount = problems.filter((p) => p.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative pb-20">
      {/* Top Header */}
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 transition flex items-center gap-1.5"
          >
            <span>📊</span> View 5 Source Feeds
          </button>
          <button
            onClick={() => setProblems(INITIAL_PROBLEMS)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Morning Ingestion Banner */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 mb-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Morning Ingestion Complete &bull; 8:30 AM
            </span>
            <span className="text-xs font-mono text-slate-400">
              Cross-checked 5 files &bull; Belgaum &bull; Hubli &bull; Gokak
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            3 High-Priority Issues Flagged for Today
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            The AI agent evaluated inventory burn-rates against supplier lead times and warehouse surpluses.
            Decide on the quantified action drafts below to execute dispatch orders.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Stores Monitored</span>
              <span className="text-base font-bold text-white">6 Locations</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Imminent Stockout</span>
              <span className="text-base font-bold text-red-400">Gokak (2 Days Left)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Overdue POs</span>
              <span className="text-base font-bold text-amber-400">PO #4412 (+4 Days)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Idle Inventory</span>
              <span className="text-base font-bold text-slate-300">Belgaum Depot</span>
            </div>
          </div>
        </section>

        {/* Action Decision Queue */}
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
            {pendingCount} Awaiting Ramesh&apos;s Signature
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

              {/* Quantified Evidence */}
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

              {/* Trade-Off Comparison */}
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

              {/* Ready Action Draft */}
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
                    Estimated Cost: <strong>{item.actionDraft.estimatedCost}</strong> &bull; Value Saved:{" "}
                    <strong className="text-emerald-400">{item.actionDraft.savingsVsAlternative}</strong>
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
                  <button
                    onClick={() => setActiveReceipt(item)}
                    className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition"
                  >
                    View Official Order Voucher 📄
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Agent Reasoning Chat Widget */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-2xl hover:scale-105 transition-all"
          >
            <span className="text-base">🤖</span>
            <span>Ask Purchasing Copilot</span>
          </button>
        ) : (
          <div className="w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col h-[460px]">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-bold text-white">Ramesh&apos;s AI Reasoner</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60 leading-relaxed"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-1.5 border-t border-slate-800/60 bg-slate-950/40 flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setChatInput("Why transfer filters to Gokak instead of ordering?")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap"
              >
                Why Gokak transfer?
              </button>
              <button
                onClick={() => setChatInput("What is our status on the overdue PO #4412?")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap"
              >
                Overdue PO #4412?
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-2">
              <input
                type="text"
                placeholder="Ask about inventory, suppliers, or lead times..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition"
              >
                Ask
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal: The 5 Raw Morning Spreadsheets */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Ramesh&apos;s Morning Ingestion Feeds (5 Spreadsheets)
                </h3>
                <p className="text-xs text-slate-400">
                  Data cross-referenced by the agent at 08:30 AM before raising recommendations.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Spreadsheet Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto px-5 pt-3 gap-2 bg-slate-950/50">
              {(
                [
                  { key: "inventory", label: "1. Stock / Inventory" },
                  { key: "sales", label: "2. Sales Velocity" },
                  { key: "suppliers", label: "3. Suppliers Directory" },
                  { key: "openPOs", label: "4. Active Open POs" },
                  { key: "storeMessages", label: "5. Store Overnight Notes" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSpreadsheet(tab.key)}
                  className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                    activeSpreadsheet === tab.key
                      ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table Display */}
            <div className="p-5 overflow-auto flex-1 font-mono text-xs">
              {activeSpreadsheet === "inventory" && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Store / Depot</th>
                      <th className="pb-2">On-Hand</th>
                      <th className="pb-2">Reserved</th>
                      <th className="pb-2">Reorder Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {RAW_SPREADSHEET_DATA.inventory.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-white">{row.sku}</td>
                        <td className="py-2.5">{row.store}</td>
                        <td className="py-2.5 text-amber-400 font-bold">{row.onHand}</td>
                        <td className="py-2.5">{row.reserved}</td>
                        <td className="py-2.5">{row.reorderPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSpreadsheet === "sales" && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Location</th>
                      <th className="pb-2">Last 7 Days</th>
                      <th className="pb-2">Daily Run-rate</th>
                      <th className="pb-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {RAW_SPREADSHEET_DATA.sales.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-white">{row.sku}</td>
                        <td className="py-2.5">{row.store}</td>
                        <td className="py-2.5">{row.last7Days} units</td>
                        <td className="py-2.5 text-blue-400 font-bold">{row.avgDaily} / day</td>
                        <td className="py-2.5">{row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSpreadsheet === "suppliers" && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-2">Vendor Name</th>
                      <th className="pb-2">Supplied SKU</th>
                      <th className="pb-2">Unit Price</th>
                      <th className="pb-2">Standard Lead</th>
                      <th className="pb-2">Express Option</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {RAW_SPREADSHEET_DATA.suppliers.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-white">{row.name}</td>
                        <td className="py-2.5">{row.sku}</td>
                        <td className="py-2.5">{row.unitCost}</td>
                        <td className="py-2.5">{row.standardLead}</td>
                        <td className="py-2.5 text-amber-300">{row.expressLead}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSpreadsheet === "openPOs" && (
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-2">PO #</th>
                      <th className="pb-2">Vendor</th>
                      <th className="pb-2">Part</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Expected Date</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {RAW_SPREADSHEET_DATA.openPOs.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-white">{row.poNumber}</td>
                        <td className="py-2.5">{row.vendor}</td>
                        <td className="py-2.5">{row.sku}</td>
                        <td className="py-2.5">{row.qty}</td>
                        <td className="py-2.5 text-red-400">{row.expectedDate}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSpreadsheet === "storeMessages" && (
                <div className="space-y-3 font-sans">
                  {RAW_SPREADSHEET_DATA.storeMessages.map((msg, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <strong className="text-amber-400">{msg.store}</strong>
                        <span className="text-slate-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-300">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official Order Voucher Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official Execution Voucher
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Kaveri Spares &amp; Hydraulics
              </h3>
              <p className="text-xs text-slate-400">
                Authorized by: Ramesh Kulkarni &bull; Head of Purchasing
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Action Reference:</span>
                <span className="font-mono font-bold text-white">
                  {activeReceipt.actionDraft.referenceId}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Action Type:</span>
                <span className="font-bold text-emerald-300">
                  {activeReceipt.actionDraft.type}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Target Item / SKU:</span>
                <span className="text-white">
                  {activeReceipt.itemName} ({activeReceipt.sku})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Assigned Logistics / Carrier:</span>
                <span className="text-white">
                  {activeReceipt.actionDraft.carrierOrVendor}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Cost Impact:</span>
                <span className="font-bold text-white">
                  {activeReceipt.actionDraft.estimatedCost}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Value Unlocked / Saved:</span>
                <span className="font-bold text-emerald-400">
                  {activeReceipt.actionDraft.savingsVsAlternative}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Cypher 2026 &bull; KD&apos;s Garage Challenge 01: Kaveri Spares &amp; Hydraulics Agent
      </footer>
    </div>
  );
}
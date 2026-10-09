# KD's Garage Supply Chain Agent - Developer Rules
You are building an autonomous supply chain co-pilot for Ramesh Kulkarni, Operations Manager at KD's Garage.

## CORE PRINCIPLES (NEVER VIOLATE):
1. **Mathematical Prioritization (Runout Calculation):**
   - ALL urgency is based on: `Runout Days = (Current Stock + Incoming PO Qty) / Daily Sales Velocity`.
   - < 3 days: CRITICAL
   - > 45 days: EXCESS / DEAD CAPITAL
   - 7 to 21 days: HEALTHY BUFFER
   - Avoid zero-division errors when velocity is 0.

2. **Trade-Off Decision Matrix:**
   - NEVER recommend a supplier reorder if an internal store has EXCESS (>30 days buffer) and can transfer within the required lead time.
   - Always calculate Total Cost: 
     - Transfer = Flat internal fee + zero MOQ.
     - Supplier = (Unit Price * MOQ) + Lead Time Downtime Risk.

3. **Strict Human-in-the-Loop:**
   - YOU DO NOT EXECUTE PURCHASES OR TRANSFERS. 
   - All proposed actions must be returned as a drafted JSON payload with `status: "PENDING_APPROVAL"`.

4. **Tone & Code Style:**
   - Write clean, modular, typed Python (Pydantic, Pandas).
   - Zero-fluff, tactical, and brutally efficient code.
   - No complex ERP integrations or ML pipelines; rely entirely on hard math and parsed logic.
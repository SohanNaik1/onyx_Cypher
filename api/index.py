from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List
from data.database import fetch_state_from_supabase
from engine.reconciler import reconcile_state
from engine.triage import run_triage
from engine.decisions import make_decisions
import pandas as pd
import os
import datetime
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InterventionItem(BaseModel):
    sku: str
    action_type: str
    quantity: int
    from_loc: str
    to_loc: str
    estimated_arrival_days: int = 0

class ApproveRequest(BaseModel):
    interventions: List[InterventionItem]

@app.get("/api/triage")
def get_triage_decisions():
    db_state = fetch_state_from_supabase()
    
    if not db_state:
        return {"error": "Failed to fetch state from Supabase."}
        
    reconciled_df = reconcile_state(db_state)
    triage_df = run_triage(reconciled_df)
    decisions = make_decisions(triage_df, reconciled_df, db_state['suppliers'])
    
    critical_count = int((triage_df['status'] == 'CRITICAL').sum())
    excess_count = int((triage_df['status'] == 'EXCESS').sum())
    
    messages_df = db_state.get('messages', pd.DataFrame())
    unlogged_alerts_parsed = not messages_df.empty
    import numpy as np
    # Build reconciled list for inventory page
    all_reconciled = reconciled_df.copy()
    all_reconciled['runout_days'] = np.where(
        all_reconciled['daily_velocity'] > 0,
        (all_reconciled['true_stock'] + all_reconciled['incoming_po_qty']) / all_reconciled['daily_velocity'],
        999.0
    )
    conditions = [
        all_reconciled['runout_days'] <= 3,
        all_reconciled['runout_days'] > 45
    ]
    choices = ['CRITICAL', 'EXCESS']
    all_reconciled['status'] = np.select(conditions, choices, default='HEALTHY')
    
    reconciled_list = []
    for _, row in all_reconciled.iterrows():
        reconciled_list.append({
            "sku": row['sku'],
            "depot": row['location'],
            "actual_stock": int(row['true_stock']),
            "velocity": float(row['daily_velocity']),
            "pipeline": int(row['incoming_po_qty']),
            "runout_days": float(row['runout_days']),
            "status": row['status']
        })
    
    return {
        "triage_summary": {
            "critical_items_count": critical_count,
            "excess_items_count": excess_count,
            "unlogged_alerts_parsed": unlogged_alerts_parsed
        },
        "interventions": decisions,
        "reconciled": reconciled_list
    }

class ActionPayload(BaseModel):
    action_type: str
    sku: str
    from_loc: str = Field(alias="from")
    to_loc: str = Field(alias="to")
    quantity: int

@app.post("/api/execute")
def execute_intervention(payload: ActionPayload):
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        return {"error": "Missing SUPABASE config."}
        
    supabase: Client = create_client(url, key)
    
    action = payload.action_type
    sku = payload.sku
    qty = payload.quantity
    
    if action == "TRANSFER":
        from_loc = payload.from_loc
        to_loc = payload.to_loc
        
        from_resp = supabase.table("inventory").select("id, stock_qty").eq("sku", sku).eq("location", from_loc).execute()
        if from_resp.data:
            from_id = from_resp.data[0]['id']
            from_qty = from_resp.data[0]['stock_qty']
            supabase.table("inventory").update({"stock_qty": from_qty - qty}).eq("id", from_id).execute()
            
        to_resp = supabase.table("inventory").select("id, stock_qty").eq("sku", sku).eq("location", to_loc).execute()
        if to_resp.data:
            to_id = to_resp.data[0]['id']
            to_qty = to_resp.data[0]['stock_qty']
            supabase.table("inventory").update({"stock_qty": to_qty + qty}).eq("id", to_id).execute()
        else:
            supabase.table("inventory").insert({"sku": sku, "location": to_loc, "stock_qty": qty}).execute()
            
    elif action == "PURCHASE_ORDER":
        supplier = payload.from_loc
        expected_date = (datetime.date.today() + datetime.timedelta(days=3)).isoformat()
        po_id = f"PO-{str(uuid.uuid4())[:8].upper()}"
        new_po = {
            "po_id": po_id,
            "supplier_id": supplier,
            "sku": sku,
            "qty": qty,
            "expected_date": expected_date,
            "status": "OPEN"
        }
        supabase.table("purchase_orders").insert(new_po).execute()
        
    return {"status": "success"}
    
@app.post("/api/reset")
def reset_database():
    import reset
    reset.main()
    return {"status": "success"}

# Mount frontend directory
app.mount("/static", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
def serve_frontend():
    return FileResponse("frontend/index.html")

@app.get("/code.html")
def serve_code_html():
    return FileResponse("frontend/code.html")

@app.get("/interventions.html")
def serve_interventions_html():
    return FileResponse("frontend/interventions.html")

@app.get("/telemetry.html")
def serve_telemetry_html():
    return FileResponse("frontend/telemetry.html")

@app.get("/inventory.html")
def serve_inventory_html():
    return FileResponse("frontend/inventory.html")

@app.get("/network.html")
def serve_network_html():
    return FileResponse("frontend/network.html")

@app.get("/settings.html")
def serve_settings_html():
    return FileResponse("frontend/settings.html")

class ChatRequest(BaseModel):
    message: str

from google import genai

@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    db_state = fetch_state_from_supabase()
    if not db_state:
        return {"response": "Error: Could not fetch database state."}
    
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    msg = req.message.lower()
    
    if not gemini_key:
        if "stock" in msg or "inventory" in msg:
            inventory = db_state.get("inventory", pd.DataFrame())
            if not inventory.empty:
                total_stock = inventory['stock_qty'].sum()
                return {"response": f"The total stock across all locations is {total_stock} units. (Add GEMINI_API_KEY to .env for full LLM capabilities)."}
            return {"response": "Inventory data is currently empty."}
            
        if "po" in msg or "purchase order" in msg:
             pos = db_state.get("purchase_orders", pd.DataFrame())
             return {"response": f"There are {len(pos)} open purchase orders."}
             
        return {"response": "I am in rule-based fallback mode. Please add GEMINI_API_KEY to .env for LLM capabilities, or ask me about 'inventory' or 'purchase orders'."}

    try:
        client = genai.Client(api_key=gemini_key)
        
        inventory_df = db_state.get('inventory', pd.DataFrame())
        po_df = db_state.get('purchase_orders', pd.DataFrame())
        
        context = "Current Database Context:\n"
        if not inventory_df.empty:
            context += f"Inventory Data:\n{inventory_df.to_markdown()}\n\n"
        if not po_df.empty:
            context += f"Purchase Orders Data:\n{po_df.to_markdown()}\n\n"
            
        system_instruction = "You are Onyx, a supply chain assistant. Use the provided database context to answer questions. You MUST use VERY simple words, explain things as if to a beginner, and avoid complex jargon. Keep your responses EXTREMELY short (1-2 sentences maximum). Do NOT write huge paragraphs."
        
        prompt = f"{context}\n\nUser query: {req.message}"
        llm_response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={"system_instruction": system_instruction}
        )
        
        return {"response": llm_response.text}
    except Exception as e:
        return {"response": f"Error communicating with LLM: {str(e)}"}

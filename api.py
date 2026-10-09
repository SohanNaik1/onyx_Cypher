from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data.database import fetch_state_from_supabase
from engine.reconciler import reconcile_state
from engine.triage import run_triage
from engine.decisions import make_decisions
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/triage")
def get_triage_decisions():
    # Fetch from Supabase
    db_state = fetch_state_from_supabase()
    
    if not db_state:
        return {"error": "Failed to fetch state from Supabase."}
        
    # Run Engine Pipeline
    reconciled_df = reconcile_state(db_state)
    triage_df = run_triage(reconciled_df)
    decisions = make_decisions(triage_df, reconciled_df, db_state['suppliers'])
    
    # Summarize Data
    critical_count = int((triage_df['status'] == 'CRITICAL').sum())
    excess_count = int((triage_df['status'] == 'EXCESS').sum())
    
    messages_df = db_state.get('messages', pd.DataFrame())
    unlogged_alerts_parsed = not messages_df.empty
    
    return {
        "triage_summary": {
            "critical_items_count": critical_count,
            "excess_items_count": excess_count,
            "unlogged_alerts_parsed": unlogged_alerts_parsed
        },
        "interventions": decisions
    }

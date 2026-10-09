import os
import datetime
import uuid
import requests
from supabase import create_client, Client
from dotenv import load_dotenv
from rich.console import Console

def main():
    console = Console()
    
    # 1. Load Supabase credentials
    load_dotenv()
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    
    if not url or not key:
        console.print("[red]Error: SUPABASE_URL or SUPABASE_KEY missing from .env[/red]")
        return
        
    supabase: Client = create_client(url, key)
    
    # 2. Fetch live decisions
    console.print("[bold cyan]Simulating Human Approval Workflow...[/bold cyan]")
    try:
        response = requests.get('http://localhost:8000/api/triage')
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        console.print(f"[red]Error fetching from API: {e}[/red]")
        return
        
    interventions = data.get("interventions", [])
    if not interventions:
        console.print("[yellow]No interventions to approve.[/yellow]")
        return
        
    console.print("\n[bold green][SUCCESS] Ramesh approved the interventions.[/bold green]\n")
    
    # 3. Execute mutations
    for item in interventions:
        action = item.get("action_type")
        sku = item.get("sku")
        qty = item.get("quantity")
        
        if action == "TRANSFER":
            from_loc = item.get("from")
            to_loc = item.get("to")
            
            # Fetch current stock for from_loc
            from_resp = supabase.table("inventory").select("id, stock_qty").eq("sku", sku).eq("location", from_loc).execute()
            if from_resp.data:
                from_id = from_resp.data[0]['id']
                from_qty = from_resp.data[0]['stock_qty']
                supabase.table("inventory").update({"stock_qty": from_qty - qty}).eq("id", from_id).execute()
                
            # Fetch current stock for to_loc
            to_resp = supabase.table("inventory").select("id, stock_qty").eq("sku", sku).eq("location", to_loc).execute()
            if to_resp.data:
                to_id = to_resp.data[0]['id']
                to_qty = to_resp.data[0]['stock_qty']
                supabase.table("inventory").update({"stock_qty": to_qty + qty}).eq("id", to_id).execute()
            else:
                # If location didn't exist for this sku, insert it
                supabase.table("inventory").insert({"sku": sku, "location": to_loc, "stock_qty": qty}).execute()
                
            console.print(f"[bold cyan][EXECUTED][/bold cyan] Transferred {qty} units of {sku} from {from_loc} to {to_loc}.")
            
        elif action == "PURCHASE_ORDER":
            supplier = item.get("from")
            lead_time = item.get("estimated_arrival_days", 0)
            expected_date = (datetime.date.today() + datetime.timedelta(days=lead_time)).isoformat()
            
            # Generate a new PO ID
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
            
            console.print(f"[bold magenta][EXECUTED][/bold magenta] Dispatched PO ({po_id}) to {supplier} for {qty} units of {sku}.")

    console.print("\n[bold green]Database mutations successfully committed. System is in sync.[/bold green]")

if __name__ == "__main__":
    main()

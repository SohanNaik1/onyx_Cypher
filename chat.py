import time
import requests
import os
import uuid
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt

def main():
    console = Console()
    
    # 1. Load Supabase credentials for approval mutations
    load_dotenv()
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    supabase: Client = create_client(url, key) if url and key else None
    
    console.print("\n[bold cyan][Agent][/bold cyan] [green]Online. Good morning, Ramesh. Type 'status' to see today's triage, or 'exit' to close.[/green]\n")
    
    pending_interventions = []
    
    while True:
        try:
            # We use python's input() when running non-interactively via heredoc
            # to avoid rich.prompt freezing when stdin is not a tty
            if not sys.stdin.isatty():
                user_input = input("[You] ").strip().lower()
                console.print(f"[bold magenta][You][/bold magenta] {user_input}")
            else:
                user_input = Prompt.ask("[bold magenta][You][/bold magenta]").strip().lower()
        except (KeyboardInterrupt, EOFError):
            break
            
        if user_input in ['exit', 'quit']:
            console.print("\n[bold cyan][Agent][/bold cyan] [green]Shutting down. Have a productive day![/green]")
            break
            
        elif user_input in ['status', 'what needs my attention', 'report']:
            console.print("\n[bold cyan][Agent][/bold cyan] [italic]Ingesting live database and parsing unstructured mechanic chats...[/italic]")
            time.sleep(1)
            
            try:
                response = requests.get('http://localhost:8000/api/triage')
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                console.print(f"[bold cyan][Agent][/bold cyan] [red]Error fetching from API: {e}[/red]\n")
                continue
                
            summary = data.get("triage_summary", {})
            pending_interventions = data.get("interventions", [])
            
            crit = summary.get('critical_items_count', 0)
            excess = summary.get('excess_items_count', 0)
            
            console.print(f"\n[bold cyan][Agent][/bold cyan] [green]I found {crit} critical stockouts and {excess} excess bottlenecks. Here are the drafted interventions for your approval:[/green]\n")
            
            # Render table
            table = Table(title="[bold magenta]Actionable Interventions[/bold magenta]", show_header=True, header_style="bold magenta")
            table.add_column("SKU", style="cyan", no_wrap=True)
            table.add_column("Action", style="bold")
            table.add_column("From -> To", style="white")
            table.add_column("Qty", justify="right", style="green")
            table.add_column("Cost (INR)", justify="right", style="red")
            table.add_column("Rationale", style="dim")
            
            for item in pending_interventions:
                action = item.get("action_type", "")
                if action == "TRANSFER":
                    action_colored = "[bold green]TRANSFER[/bold green]"
                else:
                    action_colored = "[bold yellow]PURCHASE_ORDER[/bold yellow]"
                    
                route = f"{item.get('from')} ➜ {item.get('to')}"
                cost = f"{float(item.get('estimated_cost', 0)):.2f}"
                
                table.add_row(
                    item.get("sku"),
                    action_colored,
                    route,
                    str(item.get("quantity")),
                    cost,
                    item.get("trade_off_rationale")
                )
                
            console.print(table)
            console.print("\n[bold cyan][Agent][/bold cyan] [green]Type 'approve' to execute these actions, or 'cancel' to ignore.[/green]\n")
            
        elif user_input == 'approve':
            if not pending_interventions:
                console.print("\n[bold cyan][Agent][/bold cyan] [yellow]There are no pending actions to approve.[/yellow]\n")
                continue
                
            console.print("\n[bold cyan][Agent][/bold cyan] [italic]Executing database mutations...[/italic]")
            time.sleep(1)
            
            for item in pending_interventions:
                action = item.get("action_type")
                sku = item.get("sku")
                qty = item.get("quantity")
                
                if action == "TRANSFER":
                    from_loc = item.get("from")
                    to_loc = item.get("to")
                    
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
                    supplier = item.get("from")
                    lead_time = item.get("estimated_arrival_days", 0)
                    expected_date = (datetime.date.today() + datetime.timedelta(days=lead_time)).isoformat()
                    po_id = f"PO-{str(uuid.uuid4())[:8].upper()}"
                    
                    supabase.table("purchase_orders").insert({
                        "po_id": po_id,
                        "supplier_id": supplier,
                        "sku": sku,
                        "qty": qty,
                        "expected_date": expected_date,
                        "status": "OPEN"
                    }).execute()
                    
            console.print("\n[bold cyan][Agent][/bold cyan] [bold green]Success. Database mutated. Actions executed.[/bold green]\n")
            pending_interventions = [] # Clear them after execution
            
        elif user_input == 'cancel':
            console.print("\n[bold cyan][Agent][/bold cyan] [yellow]Actions ignored. standing by.[/yellow]\n")
            pending_interventions = []
            
        else:
            if user_input:
                console.print("\n[bold cyan][Agent][/bold cyan] [yellow]I didn't quite catch that. Try 'status', 'approve', or 'exit'.[/yellow]\n")

import sys
if __name__ == "__main__":
    main()

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from data.database import seed_supabase
from data.generator import generate_mock_data
from rich.console import Console
from rich.panel import Panel

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
    
    console.print("[bold yellow]Initiating Database Wipe...[/bold yellow]")
    
    # We use a dummy filter because Supabase PostgREST requires a filter for DELETE
    # For UUID columns, we must pass a valid UUID string format.
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    dummy_text = "dummy_value_to_wipe_everything"
    
    tables_to_wipe = [
        ("messages", "id", dummy_uuid),
        ("purchase_orders", "po_id", dummy_text),
        ("sales", "id", dummy_uuid),
        ("inventory", "id", dummy_uuid),
        ("suppliers", "supplier_id", dummy_text),
        ("products", "sku", dummy_text)
    ]
    
    for table, col, dummy_val in tables_to_wipe:
        try:
            # Delete all rows where the column does not equal a dummy value (matches everything)
            supabase.table(table).delete().neq(col, dummy_val).execute()
            console.print(f"[dim]Wiped table: {table}[/dim]")
        except Exception as e:
            console.print(f"[red]Error wiping {table}: {e}[/red]")
            
    console.print("\n[bold yellow]Re-seeding Dirty Hackathon Data...[/bold yellow]")
    
    # Generate and seed exact dirty scenarios
    mock_data = generate_mock_data()
    seed_supabase(mock_data)
    
    console.print()
    console.print(Panel.fit(
        "[bold green][SYSTEM RESET] Database wiped and re-seeded. Ready for the next judge![/bold green]",
        border_style="green"
    ))

if __name__ == "__main__":
    main()

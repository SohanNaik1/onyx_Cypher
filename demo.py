import requests
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
import sys

def main():
    console = Console()
    
    # 1. Fetch data
    try:
        response = requests.get('http://localhost:8000/api/triage')
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        console.print(f"[red]Error fetching from API: {e}[/red]")
        sys.exit(1)
        
    # 2. Render Header
    console.print()
    console.rule("[bold cyan]KD's Garage - Autonomous Supply Chain Agent[/bold cyan]")
    console.print()
    
    # 3. Triage Summary Panel
    summary = data.get("triage_summary", {})
    parsed_icon = "✅" if summary.get("unlogged_alerts_parsed") else "❌"
    
    summary_text = (
        f"[bold red]Critical Items:[/bold red] {summary.get('critical_items_count', 0)}\n"
        f"[bold blue]Excess Items:[/bold blue] {summary.get('excess_items_count', 0)}\n"
        f"[bold green]Chat Alerts Parsed:[/bold green] {parsed_icon}"
    )
    
    console.print(Panel.fit(summary_text, title="[bold yellow]Morning Triage Summary[/bold yellow]", border_style="yellow"))
    console.print()
    
    # 4. Actionable Interventions Table
    interventions = data.get("interventions", [])
    
    table = Table(title="[bold magenta]Actionable Interventions (PENDING APPROVAL)[/bold magenta]", show_header=True, header_style="bold magenta")
    table.add_column("SKU", style="cyan", no_wrap=True)
    table.add_column("Action", style="bold")
    table.add_column("From -> To", style="white")
    table.add_column("Qty", justify="right", style="green")
    table.add_column("Cost (INR)", justify="right", style="red")
    table.add_column("Rationale", style="dim")
    
    for item in interventions:
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
    console.print()

if __name__ == "__main__":
    main()

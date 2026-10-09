import json
import pandas as pd
from data.generator import generate_mock_data
from engine.reconciler import reconcile_state
from engine.triage import run_triage
from engine.decisions import make_decisions

def print_presentation(triage_df: pd.DataFrame, decisions: list):
    # 1. MORNING TRIAGE SUMMARY
    critical_count = len(triage_df[triage_df['status'] == 'CRITICAL'])
    excess_count = len(triage_df[triage_df['status'] == 'EXCESS'])
    
    print("1. MORNING TRIAGE SUMMARY")
    print(f"- {critical_count} CRITICAL items detected.")
    print(f"- {excess_count} EXCESS items detected.")
    print("- Parsed unlogged chat alerts and adjusted true stock values accordingly.")
    print("\n2. ACTIONABLE INTERVENTIONS\n")
    
    # 2. ACTIONABLE INTERVENTIONS
    for decision in decisions:
        print(f"- Item SKU: {decision['sku']}")
        print(f"- Recommended Action: {decision['action_type']}")
        print(f"- Source & Destination: From {decision['from']} to {decision['to']}")
        print(f"- Quantity: {decision['quantity']}")
        print(f"- Trade-Off Rationale: {decision['trade_off_rationale']}")
        print("- Draft Payload:")
        print(json.dumps(decision, indent=2))
        print("-" * 50)

def main():
    mock_data = generate_mock_data()
    reconciled_df = reconcile_state(mock_data)
    triage_df = run_triage(reconciled_df)
    decisions = make_decisions(triage_df, reconciled_df, mock_data['suppliers'])
    
    print_presentation(triage_df, decisions)

if __name__ == "__main__":
    main()

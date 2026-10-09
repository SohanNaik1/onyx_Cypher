import pandas as pd
import numpy as np

def make_decisions(triage_df: pd.DataFrame, all_reconciled_df: pd.DataFrame, suppliers_df: pd.DataFrame) -> list[dict]:
    decisions = []
    
    # Ensure all_reconciled_df has runout_days calculated
    if 'runout_days' not in all_reconciled_df.columns:
        all_reconciled_df = all_reconciled_df.copy()
        all_reconciled_df['runout_days'] = np.where(
            all_reconciled_df['daily_velocity'] > 0,
            (all_reconciled_df['true_stock'] + all_reconciled_df['incoming_po_qty']) / all_reconciled_df['daily_velocity'],
            999.0
        )
    
    # We only care about CRITICAL items for decisions
    critical_items = triage_df[triage_df['status'] == 'CRITICAL']
    
    for _, item in critical_items.iterrows():
        sku = item['sku']
        loc = item['location']
        runout_days = item['runout_days']
        velocity = item['daily_velocity']
        
        # 1. Check Internal First (Transfer)
        # Look in all_reconciled_df for the same SKU at a different location where runout_days > 30 (Excess)
        excess_locations = all_reconciled_df[
            (all_reconciled_df['sku'] == sku) & 
            (all_reconciled_df['location'] != loc) & 
            (all_reconciled_df['runout_days'] > 30)
        ]
        
        if not excess_locations.empty:
            # Pick the location with the most excess (highest runout_days)
            best_excess = excess_locations.sort_values(by='runout_days', ascending=False).ililed_df['daily_velocity'] > 0,
            (all_reconciled_df['true_stock'] + all_reconciled_df['incoming_po_qty']) / all_reconciled_df['daily_velocity'],
            999.0
        )
    
    # We only care about CRITICAL items for decisions
    critical_items = triage_df[triage_df['status'] == 'CRITICAL']
    
    for _, item in critical_items.iterrows():
        sku = item['sku']
        loc = item['location']
        runout_days = item['runout_days']
        velocity = item['daily_velocity']
        
        # 1. Check Internal First (Transfer)
        # Look in all_reconciled_df for the same SKU at a different location where runout_days > 30 (Excess)
        excess_locations = all_reconciled_df[
            (all_reconciled_df['sku'] == sku) & 
            (all_reconciled_df['location'] != loc) & 
            (all_reconciled_df['runout_days'] > 30)
        ]
        
        if not excess_locations.empty:
            # Pick the location with the most excess (highest runout_days)
            best_excess = excess_locations.sort_values(by='runout_days', ascending=False).iloc[0]
            
            # Enough to give the critical location a 14-day bufoc[0]
            
            # Enough to give the critical location a 14-day buffer
            transfer_qty = int(np.ceil(14 * velocity))
            if transfer_qty == 0:
                transfer_qty = 1
                
            decision = {
                "action_type": "TRANSFER",
                "sku": sku,
                "from": best_excess['location'],
                "to": loc,
                "quantity": transfer_qty,
                "estimated_cost": 50.0,
                "estimated_arrival_days": 1,
                "trade_off_rationale": "Internal transfer utilizes dead capital at flat 50 INR fee, avoiding MOQ lockup.",
                "status": "PENDING_APPROVAL"
            }
            decisions.append(decision)
            continue
            
        # 2. Supplier Fallback (Purchase Order)
        sku_suppliers = suppliers_df[suppliers_df['sku'] == sku]
        if not sku_suppliers.empty:
            sku_suppliers = sku_suppliers.copy()
            sku_suppliers['total_cost'] = sku_suppliers['unit_price'] * sku_suppliers['moq']
            
            # Prioritize survival: lead_time_days <= runout_days
            valid_suppliers = sku_suppliers[sku_suppliers['lead_time_days'] <= runout_days]
            
            if not valid_suppliers.empty:
                # Among valid surviving suppliers, we can pick the cheapest
                best_supplier = valid_suppliers.sort_values(by='total_cost').iloc[0]
            else:
                # If no supplier can meet the runout date, pick the one with the shortest lead time (closest to runout)
                best_supplier = sku_suppliers.sort_values(by='lead_time_days').iloc[0]
                
            qty = int(best_supplier['moq'])
            cost = float(best_supplier['total_cost'])
            lead_time = int(best_supplier['lead_time_days'])
            
            rationale = f"Selected faster supplier to prevent imminent stockout (Runout: {runout_days:.1f} days vs Lead Time: {lead_time} days), despite higher unit cost."
            
            decision = {
                "action_type": "PURCHASE_ORDER",
                "sku": sku,
                "from": best_supplier['supplier_id'],
                "to": loc,
                "quantity": qty,
                "estimated_cost": cost,
                "estimated_arrival_days": lead_time,
                "trade_off_rationale": rationale,
                "status": "PENDING_APPROVAL"
            }
            decisions.append(decision)
            
    return decisions

import pandas as pd
import numpy as np

def run_triage(reconciled_df: pd.DataFrame) -> pd.DataFrame:
    df = reconciled_df.copy()
    
    # Calculate runout_days
    df['runout_days'] = np.where(
        df['daily_velocity'] > 0,
        (df['true_stock'] + df['incoming_po_qty']) / df['daily_velocity'],
        999.0
    )
    
    # Create status column
    conditions = [
        df['runout_days'] <= 3,
        df['runout_days'] > 45
    ]
    choices = ['CRITICAL', 'EXCESS']
    df['status'] = np.select(conditions, choices, default='HEALTHY')
    
    # Filter to ONLY 'CRITICAL' and 'EXCESS'
    filtered_df = df[df['status'].isin(['CRITICAL', 'EXCESS'])]
    
    # Sort by runout_days ascending (most urgent first)
    sorted_df = filtered_df.sort_values(by='runout_days', ascending=True).reset_index(drop=True)
    
    return sorted_df

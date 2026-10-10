import pandas as pd
import re

def reconcile_state(data: dict) -> pd.DataFrame:
    inventory_df = data['inventory'].copy()
    sales_df = data['sales'].copy()
    po_df = data['purchase_orders'].copy()
    messages_df = data['messages'].copy()
    
    # 1. Velocity: Group by sku and location, sum qty_sold, divide by 30
    if not sales_df.empty:
        sales_df_copy = sales_df.copy()
        if 'date' in sales_df_copy.columns:
            max_date = pd.to_datetime(sales_df_copy['date']).max()
            start_date = max_date - pd.Timedelta(days=30)
            recent_sales = sales_df_copy[pd.to_datetime(sales_df_copy['date']) >= start_date]
            if recent_sales.empty:
                recent_sales = sales_df_copy
            velocity_df = recent_sales.groupby(['sku', 'location'])['qty_sold'].sum().reset_index()
            velocity_df['daily_velocity'] = velocity_df['qty_sold'] / 30.0
        else:
            velocity_df = sales_df_copy.groupby(['sku', 'location'])['qty_sold'].sum().reset_index()
            velocity_df['daily_velocity'] = velocity_df['qty_sold'] / 30.0
        velocity_df = velocity_df[['sku', 'location', 'daily_velocity']]
    else:
        velocity_df = pd.DataFrame(columns=['sku', 'location', 'daily_velocity'])
        
    # Merge velocity with inventory
    reconciled = pd.merge(inventory_df, velocity_df, on=['sku', 'location'], how='left')
    reconciled['daily_velocity'] = reconciled['daily_velocity'].fillna(0.0)
    
    # 2. Incoming POs: Sum qty where status is OPEN/Confirmed for each SKU
    if not po_df.empty:
        po_copy = po_df.copy()
        status_upper = po_copy['status'].astype(str).str.upper()
        open_pos = po_copy[status_upper.isin(['OPEN', 'CONFIRMED'])]
        incoming_po_df = open_pos.groupby('sku')['qty'].sum().reset_index()
        incoming_po_df.rename(columns={'qty': 'incoming_po_qty'}, inplace=True)
    else:
        incoming_po_df = pd.DataFrame(columns=['sku', 'incoming_po_qty'])
        
    # Merge incoming POs. Broadcast to the SKU since POs don't have location in mock
    reconciled = pd.merge(reconciled, incoming_po_df, on='sku', how='left')
    reconciled['incoming_po_qty'] = reconciled['incoming_po_qty'].fillna(0).astype(int)
    
    # 3. True Stock (NLP Mock)
    stock_col = 'stock_qty' if 'stock_qty' in reconciled.columns else 'stock'
    reconciled['true_stock'] = reconciled[stock_col].fillna(0).astype(int)
    
    # Regex pattern for "X units ... damaged" or "X ... damaged"
    pattern = re.compile(r'(\d+).*damaged', re.IGNORECASE)
    sku_pattern = re.compile(r'([A-Z]{2,4}-\d+|SKU-\d+)', re.IGNORECASE)
    
    if not messages_df.empty:
        for idx, row in messages_df.iterrows():
            msg = str(row.get('message_text', ''))
            loc = str(row.get('location', ''))
            
            sku_match = sku_pattern.search(msg)
            if sku_match:
                sku = sku_match.group(1).upper()
                damage_match = pattern.search(msg)
                
                if damage_match:
                    damaged_qty = int(damage_match.group(1))
                    mask = (reconciled['sku'].str.upper() == sku) & (reconciled['location'].str.lower() == loc.lower())
                    reconciled.loc[mask, 'true_stock'] -= damaged_qty

    reconciled['true_stock'] = reconciled['true_stock'].apply(lambda x: max(0, int(x)))
    
    cols = ['sku', 'location', 'true_stock', 'incoming_po_qty', 'daily_velocity']
    return reconciled[cols]

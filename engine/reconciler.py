import pandas as pd
import re

def reconcile_state(data: dict) -> pd.DataFrame:
    inventory_df = data['inventory'].copy()
    sales_df = data['sales'].copy()
    po_df = data['purchase_orders'].copy()
    messages_df = data['messages'].copy()
    
    # 1. Velocity: Group by sku and location, sum qty_sold, divide by 30
    if not sales_df.empty:
        velocity_df = sales_df.groupby(['sku', 'location'])['qty_sold'].sum().reset_index()
        velocity_df['daily_velocity'] = velocity_df['qty_sold'] / 30.0
        velocity_df = velocity_df.drop(columns=['qty_sold'])
    else:
        velocity_df = pd.DataFrame(columns=['sku', 'location', 'daily_velocity'])
        
    # Merge velocity with inventory
    reconciled = pd.merge(inventory_df, velocity_df, on=['sku', 'location'], how='left')
    reconciled['daily_velocity'] = reconciled['daily_velocity'].fillna(0.0)
    
    # 2. Incoming POs: Sum qty where status == 'OPEN' for each SKU
    if not po_df.empty:
        today = pd.Timestamp.today().date()
        open_pos = po_df[(po_df['status'] == 'OPEN') & (pd.to_datetime(po_df['expected_date']).dt.date >= today)]
        incoming_po_df = open_pos.groupby('sku')['qty'].sum().reset_index()
        incoming_po_df.rename(columns={'qty': 'incoming_po_qty'}, inplace=True)
    else:
        incoming_po_df = pd.DataFrame(columns=['sku', 'incoming_po_qty'])
        
    # Merge incoming POs. Broadcast to the SKU since POs don't have location in mock
    reconciled = pd.merge(reconciled, incoming_po_df, on='sku', how='left')
    reconciled['incoming_po_qty'] = reconciled['incoming_po_qty'].fillna(0).astype(int)
    
    # 3. True Stock (NLP Mock)
    reconciled['true_stock'] = reconciled['stock_qty']
    
    # Regex pattern for "X units ... damaged" or "X ... damaged"
    pattern = re.compile(r'(\d+).*damaged', re.IGNORECASE)
    
    for idx, row in messages_df.iterrows():
        msg = row['message_text']
        loc = row['location']
        
        sku_match = re.search(r'(SKU-\d+)', msg)
        if sku_match:
            sku = sku_match.group(1)
            damage_match = pattern.search(msg)
            
            if damage_match:
                damaged_qty = int(damage_match.group(1))
                mask = (reconciled['sku'] == sku) & (reconciled['location'] == loc)
                reconciled.loc[mask, 'true_stock'] -= damaged_qty

    reconciled['true_stock'] = reconciled['true_stock'].apply(lambda x: max(0, x))
    
    cols = ['sku', 'location', 'true_stock', 'incoming_po_qty', 'daily_velocity']
    return reconciled[cols]

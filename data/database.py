import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Note: this will fail if the URL or KEY are missing or invalid
try:
    supabase: Client = create_client(url, key)
except Exception as e:
    supabase = None
    print(f"Warning: Could not initialize Supabase client. {e}")

def seed_supabase(mock_data: dict):
    if not supabase:
        print("Supabase client not initialized. Cannot seed database.")
        return
        
    tables = ['products', 'inventory', 'sales', 'suppliers', 'purchase_orders', 'messages']
    
    for table_name in tables:
        if table_name not in mock_data:
            continue
            
        df = mock_data[table_name]
        
        # Handle datetime serialization for JSON payload
        df_copy = df.copy()
        for col in df_copy.columns:
            if pd.api.types.is_datetime64_any_dtype(df_copy[col]) or pd.api.types.is_object_dtype(df_copy[col]):
                try:
                    df_copy[col] = df_copy[col].astype(str)
                except Exception:
                    pass
                    
        records = df_copy.to_dict(orient='records')
        
        if records:
            supabase.table(table_name).insert(records).execute()
            print(f"Successfully seeded {len(records)} records into '{table_name}' table.")

def load_kdgarage_local() -> dict:
    kd_dir = os.path.join(os.path.dirname(__file__), "kdgarage")
    if not os.path.exists(kd_dir):
        return {}
        
    data = {}
    if os.path.exists(os.path.join(kd_dir, "products.csv")):
        df = pd.read_csv(os.path.join(kd_dir, "products.csv"))
        data['products'] = df.rename(columns={"product_name": "name"})
        
    if os.path.exists(os.path.join(kd_dir, "inventory.csv")):
        df = pd.read_csv(os.path.join(kd_dir, "inventory.csv"))
        data['inventory'] = df.rename(columns={"stock": "stock_qty"})
        
    if os.path.exists(os.path.join(kd_dir, "purchase_orders.csv")):
        df = pd.read_csv(os.path.join(kd_dir, "purchase_orders.csv"))
        data['purchase_orders'] = df.rename(columns={"po": "po_id", "supplier": "supplier_id"})
        
    if os.path.exists(os.path.join(kd_dir, "sales.csv")):
        df = pd.read_csv(os.path.join(kd_dir, "sales.csv"))
        df['date'] = pd.to_datetime(df['date']).dt.date
        data['sales'] = df
        
    if os.path.exists(os.path.join(kd_dir, "suppliers.csv")):
        df = pd.read_csv(os.path.join(kd_dir, "suppliers.csv"))
        data['suppliers'] = df.rename(columns={"supplier": "supplier_id", "price": "unit_price"})
        
    data['messages'] = pd.DataFrame([
        {"timestamp": pd.to_datetime("2026-11-15T08:30:00"), "location": "Gokak", "message_text": "Supervisor alert: 15 units of FLT-1021 damaged at Gokak storage yard."}
    ])
    return data

_cache = {}
_cache_time = 0.0
CACHE_TTL = 60.0  # seconds

def invalidate_cache():
    global _cache_time, _cache
    _cache_time = 0.0
    _cache = {}

def fetch_table_paginated(table_name: str) -> pd.DataFrame:
    if not supabase:
        return pd.DataFrame()
    rows = []
    page = 0
    limit = 1000
    while True:
        res = supabase.table(table_name).select("*").range(page * limit, (page + 1) * limit - 1).execute()
        if not res.data:
            break
        rows.extend(res.data)
        if len(res.data) < limit:
            break
        page += 1
    return pd.DataFrame(rows)

def fetch_state_from_supabase(force_refresh: bool = False) -> dict:
    global _cache, _cache_time
    import time
    now = time.time()
    
    if not force_refresh and _cache and (now - _cache_time < CACHE_TTL):
        return _cache

    if os.environ.get("DATA_SOURCE", "").upper() == "LOCAL":
        local_data = load_kdgarage_local()
        if local_data:
            _cache = local_data
            _cache_time = now
            return _cache

    if not supabase:
        print("Supabase client not initialized. Falling back to local dataset.")
        return load_kdgarage_local()
        
    mock_data = {}
    tables = ['products', 'inventory', 'sales', 'suppliers', 'purchase_orders', 'messages']
    
    for table_name in tables:
        # Fetch paginated for sales and inventory to avoid Supabase 1000-row limit truncation
        if table_name in ['sales', 'inventory']:
            df = fetch_table_paginated(table_name)
        else:
            response = supabase.table(table_name).select("*").execute()
            df = pd.DataFrame(response.data)
        
        if not df.empty:
            # Convert date/time columns back to appropriate formats expected by the engine
            try:
                if table_name == 'sales' and 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'], format='mixed', errors='coerce').dt.date
                elif table_name == 'purchase_orders' and 'expected_date' in df.columns:
                    df['expected_date'] = pd.to_datetime(df['expected_date'], format='mixed', errors='coerce').dt.date
                elif table_name == 'messages' and 'timestamp' in df.columns:
                    df['timestamp'] = pd.to_datetime(df['timestamp'], format='mixed', errors='coerce')
            except Exception as date_err:
                print(f"Warning parsing dates for {table_name}: {date_err}")
                
        mock_data[table_name] = df
        
    _cache = mock_data
    _cache_time = now
    print(f"Successfully fetched state from Supabase (cached for {CACHE_TTL}s).")
    return _cache

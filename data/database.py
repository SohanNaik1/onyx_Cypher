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

def fetch_state_from_supabase() -> dict:
    if os.environ.get("DATA_SOURCE", "").upper() == "LOCAL":
        local_data = load_kdgarage_local()
        if local_data:
            print("Loaded KD Garage dataset directly from local files.")
            return local_data

    if not supabase:
        print("Supabase client not initialized. Falling back to local dataset.")
        return load_kdgarage_local()
        
    mock_data = {}
    tables = ['products', 'inventory', 'sales', 'suppliers', 'purchase_orders', 'messages']
    
    for table_name in tables:
        # Fetch all records
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
        
    print("Successfully fetched state from Supabase.")
    return mock_data

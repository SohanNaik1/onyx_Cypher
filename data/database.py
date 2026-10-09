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

def fetch_state_from_supabase() -> dict:
    if not supabase:
        print("Supabase client not initialized. Cannot fetch data.")
        return {}
        
    mock_data = {}
    tables = ['products', 'inventory', 'sales', 'suppliers', 'purchase_orders', 'messages']
    
    for table_name in tables:
        # Fetch all records
        response = supabase.table(table_name).select("*").execute()
        df = pd.DataFrame(response.data)
        
        if not df.empty:
            # Convert date/time columns back to appropriate formats expected by the engine
            if table_name == 'sales':
                df['date'] = pd.to_datetime(df['date']).dt.date
            elif table_name == 'purchase_orders':
                df['expected_date'] = pd.to_datetime(df['expected_date']).dt.date
            elif table_name == 'messages':
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
        mock_data[table_name] = df
        
    print("Successfully fetched state from Supabase.")
    return mock_data

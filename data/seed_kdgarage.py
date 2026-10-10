import os
import sys
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(url, key)

KDGARAGE_DIR = os.path.join(os.path.dirname(__file__), "kdgarage")

def seed_kdgarage(include_sales: bool = True):
    print(f"Loading dataset from: {KDGARAGE_DIR}")
    
    # 1. Products (126 rows)
    prod_path = os.path.join(KDGARAGE_DIR, "products.csv")
    if os.path.exists(prod_path):
        prod_df = pd.read_csv(prod_path)
        prod_df = prod_df.rename(columns={"product_name": "name"})
        records = prod_df.to_dict(orient="records")
        print(f"Seeding {len(records)} products...")
        # Upsert products in chunks of 200
        for i in range(0, len(records), 200):
            supabase.table("products").upsert(records[i:i+200]).execute()
        print("✓ Products seeded successfully.")

    # 2. Inventory (1,008 rows)
    inv_path = os.path.join(KDGARAGE_DIR, "inventory.csv")
    if os.path.exists(inv_path):
        inv_df = pd.read_csv(inv_path)
        inv_df = inv_df.rename(columns={"stock": "stock_qty"})
        records = inv_df.to_dict(orient="records")
        print(f"Seeding {len(records)} inventory records...")
        # Clear old inventory first
        try:
            supabase.table("inventory").delete().neq("id", -1).execute()
        except Exception:
            pass
        for i in range(0, len(records), 200):
            supabase.table("inventory").insert(records[i:i+200]).execute()
        print("✓ Inventory seeded successfully.")

    # 3. Suppliers (205 rows)
    supp_path = os.path.join(KDGARAGE_DIR, "suppliers.csv")
    if os.path.exists(supp_path):
        supp_df = pd.read_csv(supp_path)
        supp_df = supp_df.rename(columns={"supplier": "supplier_id", "price": "unit_price"})
        records = supp_df.to_dict(orient="records")
        print(f"Seeding {len(records)} suppliers...")
        try:
            supabase.table("suppliers").delete().neq("supplier_id", "__none__").execute()
        except Exception:
            pass
        for i in range(0, len(records), 200):
            supabase.table("suppliers").insert(records[i:i+200]).execute()
        print("✓ Suppliers seeded successfully.")

    # 4. Purchase Orders (43 rows)
    po_path = os.path.join(KDGARAGE_DIR, "purchase_orders.csv")
    if os.path.exists(po_path):
        po_df = pd.read_csv(po_path)
        po_df = po_df.rename(columns={"po": "po_id", "supplier": "supplier_id"})
        records = po_df.to_dict(orient="records")
        print(f"Seeding {len(records)} purchase orders...")
        try:
            supabase.table("purchase_orders").delete().neq("po_id", "__none__").execute()
        except Exception:
            pass
        for i in range(0, len(records), 200):
            supabase.table("purchase_orders").insert(records[i:i+200]).execute()
        print("✓ Purchase orders seeded successfully.")

    # 5. Messages / Unlogged telemetry alerts
    messages_data = [
        {"timestamp": "2026-11-15T08:30:00", "location": "Gokak", "message_text": "Supervisor WhatsApp: 15 units of FLT-1021 found damaged at Gokak storage yard."}
    ]
    try:
        supabase.table("messages").delete().neq("id", -1).execute()
    except Exception:
        pass
    supabase.table("messages").insert(messages_data).execute()
    print("✓ Telemetry alerts seeded successfully.")

    # 6. Sales (12,777 rows)
    if include_sales:
        sales_path = os.path.join(KDGARAGE_DIR, "sales.csv")
        if os.path.exists(sales_path):
            sales_df = pd.read_csv(sales_path)
            records = sales_df.to_dict(orient="records")
            print(f"Seeding {len(records)} sales rows in batches of 500 (this may take ~20-30s)...")
            try:
                supabase.table("sales").delete().neq("id", -1).execute()
            except Exception:
                pass
            for i in range(0, len(records), 500):
                supabase.table("sales").insert(records[i:i+500]).execute()
                print(f"  Inserted {min(i+500, len(records))}/{len(records)} sales records...")
            print("✓ Sales seeded successfully.")

    print("\nAll KD Garage / Challenge 01 datasets successfully loaded into Supabase!")

if __name__ == "__main__":
    seed_kdgarage()

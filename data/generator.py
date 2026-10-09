import pandas as pd
import datetime
from datetime import timedelta

def generate_mock_data() -> dict:
    today = datetime.date.today()
    now = datetime.datetime.now()
    
    # 1. Products
    products_data = [
        {"sku": "SKU-101", "name": "Filter", "machine_model": "Generic", "category": "Consumables"},
        {"sku": "SKU-202", "name": "Clutch", "machine_model": "Generic", "category": "Drivetrain"},
        {"sku": "SKU-303", "name": "Shock Absorber", "machine_model": "Generic", "category": "Suspension"},
        {"sku": "SKU-404", "name": "Brake Pads", "machine_model": "Generic", "category": "Brakes"} # Background noise
    ]
    
    # 2. Inventory
    inventory_data = [
        # Scenario A
        {"sku": "SKU-101", "location": "Gokak", "stock_qty": 8},
        {"sku": "SKU-101", "location": "Belgaum", "stock_qty": 50},
        # Scenario B
        {"sku": "SKU-202", "location": "Gokak", "stock_qty": 2},
        # Scenario C
        {"sku": "SKU-303", "location": "Gokak", "stock_qty": 10},
        # Background noise
        {"sku": "SKU-404", "location": "Gokak", "stock_qty": 20},
        {"sku": "SKU-404", "location": "Belgaum", "stock_qty": 25}
    ]
    
    # 3. Sales
    sales_data = []
    # Scenario A: 30 days of sales history for 'Gokak' showing exactly 4 units sold per day
    for i in range(1, 31):
        sale_date = today - timedelta(days=i)
        sales_data.append({
            "date": sale_date,
            "sku": "SKU-101",
            "location": "Gokak",
            "qty_sold": 4
        })
    
    # Scenario B: Sells exactly 1 per day at 'Gokak'
    for i in range(1, 31):
        sale_date = today - timedelta(days=i)
        sales_data.append({
            "date": sale_date,
            "sku": "SKU-202",
            "location": "Gokak",
            "qty_sold": 1
        })
        
    # Scenario C: Sells 2 per day at 'Gokak'
    for i in range(1, 31):
        sale_date = today - timedelta(days=i)
        sales_data.append({
            "date": sale_date,
            "sku": "SKU-303",
            "location": "Gokak",
            "qty_sold": 2
        })
        
    # Background noise sales
    for i in range(1, 5):
        sale_date = today - timedelta(days=i)
        sales_data.append({
            "date": sale_date,
            "sku": "SKU-404",
            "location": "Gokak",
            "qty_sold": 1
        })
    
    # 4. Suppliers
    suppliers_data = [
        # Scenario A
        {"supplier_id": "SUP-A", "sku": "SKU-101", "unit_price": 100.0, "lead_time_days": 7, "moq": 10},
        {"supplier_id": "SUP-B", "sku": "SKU-101", "unit_price": 150.0, "lead_time_days": 3, "moq": 5},
        # Background noise
        {"supplier_id": "SUP-C", "sku": "SKU-202", "unit_price": 500.0, "lead_time_days": 10, "moq": 2},
        {"supplier_id": "SUP-C", "sku": "SKU-303", "unit_price": 300.0, "lead_time_days": 5, "moq": 4}
    ]
    
    # 5. Purchase Orders
    po_data = [
        # Scenario B
        {
            "po_id": "PO-1001",
            "supplier_id": "SUP-C",
            "sku": "SKU-202",
            "qty": 10,
            "expected_date": today - timedelta(days=2),
            "status": "OPEN"
        },
        # Background noise
        {
            "po_id": "PO-1002",
            "supplier_id": "SUP-A",
            "sku": "SKU-404",
            "qty": 20,
            "expected_date": today + timedelta(days=5),
            "status": "OPEN"
        }
    ]
    
    # 6. Messages
    messages_data = [
        # Scenario C
        {
            "timestamp": now,
            "location": "Gokak",
            "message_text": "Hey, 4 units of SKU-303 were damaged on delivery, throwing them out."
        },
        # Background noise
        {
            "timestamp": now - timedelta(hours=5),
            "location": "Belgaum",
            "message_text": "Store opened normally today."
        }
    ]
    
    return {
        "products": pd.DataFrame(products_data),
        "inventory": pd.DataFrame(inventory_data),
        "sales": pd.DataFrame(sales_data),
        "suppliers": pd.DataFrame(suppliers_data),
        "purchase_orders": pd.DataFrame(po_data),
        "messages": pd.DataFrame(messages_data)
    }

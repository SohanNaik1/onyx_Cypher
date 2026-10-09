from datetime import date, datetime
from pydantic import BaseModel

class Product(BaseModel):
    sku: str
    name: str
    machine_model: str
    category: str

class Inventory(BaseModel):
    sku: str
    location: str
    stock_qty: int

class Sale(BaseModel):
    date: date
    sku: str
    location: str
    qty_sold: int

class Supplier(BaseModel):
    supplier_id: str
    sku: str
    unit_price: float
    lead_time_days: int
    moq: int

class PurchaseOrder(BaseModel):
    po_id: str
    supplier_id: str
    sku: str
    qty: int
    expected_date: date
    status: str

class StoreMessage(BaseModel):
    timestamp: datetime
    location: str
    message_text: str

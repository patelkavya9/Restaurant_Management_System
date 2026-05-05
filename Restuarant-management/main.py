from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import qrcode
import io
import base64
from typing import Optional, List
from datetime import datetime
import json
import os

app = FastAPI(title="Restaurant Management API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage (replace with MongoDB later if needed)
tables_db = {}
orders_db = []

# Data models
class OrderItem(BaseModel):
    dish_name: str
    quantity: int
    price: float

class Order(BaseModel):
    table_number: int
    items: List[OrderItem]
    total_amount: float
    customer_notes: Optional[str] = ""

class OrderResponse(BaseModel):
    order_id: str
    table_number: int
    items: List[OrderItem]
    total_amount: float
    status: str
    timestamp: str
    customer_notes: Optional[str] = ""

# Initialize some tables
for i in range(1, 21):  # Tables 1-20
    tables_db[i] = {
        "table_number": i,
        "qr_generated": True,
        "status": "available"  # available, occupied, reserved
    }

@app.get("/")
def read_root():
    return {"message": "Restaurant Management System API", "status": "running"}

def _build_menu_url(table_number: int) -> str:
    """Build frontend menu URL for QR redirection, using env vars when available."""
    base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    # Default to multi-page Vite route menu.html; allow override to e.g. /menu
    menu_path = os.getenv("FRONTEND_MENU_PATH", "/menu.html")
    return f"{base_url}{menu_path}?table={table_number}"


@app.get("/api/generate-qr/{table_number}")
def generate_qr_code(table_number: int):
    """Generate QR code for a specific table"""
    if table_number not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # QR code will contain backend redirect URL which updates status and redirects to menu
    backend_base = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
    qr_url = f"{backend_base}/api/qr/{table_number}"
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(img_buffer.getvalue()),
        media_type="image/png",
        headers={"Content-Disposition": f"inline; filename=table_{table_number}_qr.png"}
    )

@app.get("/api/qr/{table_number}")
def get_qr_redirect(table_number: int):
    """Handle QR code scan redirect"""
    if table_number not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Update table status
    tables_db[table_number]["status"] = "occupied"
    
    # Redirect to frontend menu with table number
    return RedirectResponse(url=_build_menu_url(table_number))

@app.get("/api/table/{table_number}")
def get_table_info(table_number: int):
    """Get table information"""
    if table_number not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    return tables_db[table_number]

@app.get("/api/tables")
def get_all_tables():
    """Get all tables"""
    return {"tables": list(tables_db.values())}


class AddTableRequest(BaseModel):
    table_number: int


@app.post("/api/tables")
def add_table(payload: AddTableRequest):
    """Add a new table to the system and mark QR as generated."""
    table_number = payload.table_number
    if table_number in tables_db:
        # Idempotent: return existing table
        return tables_db[table_number]

    tables_db[table_number] = {
        "table_number": table_number,
        "qr_generated": True,
        "status": "available",
    }
    return tables_db[table_number]

@app.post("/api/orders")
def create_order(order: Order):
    """Create a new order"""
    if order.table_number not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Generate order ID
    order_id = f"ORD_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{order.table_number}"
    
    # Create order record
    order_record = {
        "order_id": order_id,
        "table_number": order.table_number,
        "items": [item.dict() for item in order.items],
        "total_amount": order.total_amount,
        "status": "pending",  # pending, confirmed, preparing, ready, served, cancelled
        "timestamp": datetime.now().isoformat(),
        "customer_notes": order.customer_notes or ""
    }
    
    # Store order
    orders_db.append(order_record)
    
    # Update table status
    tables_db[order.table_number]["status"] = "occupied"
    
    return OrderResponse(**order_record)

@app.get("/api/orders")
def get_all_orders(status: Optional[str] = None):
    """Get all orders, optionally filtered by status"""
    filtered_orders = orders_db
    
    if status:
        filtered_orders = [order for order in orders_db if order["status"] == status]
    
    return {"orders": filtered_orders}

@app.get("/api/orders/table/{table_number}")
def get_orders_by_table(table_number: int):
    """Get orders for a specific table"""
    if table_number not in tables_db:
        raise HTTPException(status_code=404, detail="Table not found")
    
    table_orders = [order for order in orders_db if order["table_number"] == table_number]
    return {"orders": table_orders}

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: str, status: str):
    """Update order status"""
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "served", "cancelled"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    # Find order
    order_found = False
    for order in orders_db:
        if order["order_id"] == order_id:
            order["status"] = status
            order_found = True
            break
    
    if not order_found:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated", "order_id": order_id, "new_status": status}

@app.delete("/api/orders/{order_id}")
def cancel_order(order_id: str):
    """Cancel an order"""
    global orders_db
    
    # Find and remove order
    order_found = False
    for i, order in enumerate(orders_db):
        if order["order_id"] == order_id:
            orders_db[i]["status"] = "cancelled"
            order_found = True
            break
    
    if not order_found:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order cancelled", "order_id": order_id}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
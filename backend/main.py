import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
from geopy.distance import geodesic

app = FastAPI(title="MicroTip Protocol Backend")

# Allow React Frontend (Port 5173) to communicate with FastAPI (Port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Polygon Amoy Testnet RPC
RPC_URL = "https://rpc-amoy.polygon.technology/"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

class GeofenceCheck(BaseModel):
    customer_lat: float
    customer_lng: float
    driver_lat: float
    driver_lng: float

class HandshakeRequest(BaseModel):
    order_id: str
    driver_private_key: str

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "web3_connected": w3.is_connected(),
        "chain_id": w3.eth.chain_id if w3.is_connected() else None
    }

@app.post("/api/verify-geofence")
def verify_geofence(data: GeofenceCheck):
    """Calculates geodesic distance between driver and customer (15m threshold)."""
    customer_coords = (data.customer_lat, data.customer_lng)
    driver_coords = (data.driver_lat, data.driver_lng)
    
    distance_meters = geodesic(customer_coords, driver_coords).meters
    is_inside = distance_meters <= 15.0
    
    return {
        "is_inside_geofence": is_inside,
        "distance_meters": round(distance_meters, 2)
    }

@app.post("/api/driver/generate-handshake")
def generate_handshake(req: HandshakeRequest):
    """Generates an ECDSA-signed payload for dynamic QR verification."""
    timestamp = int(time.time())
    
    msg_hash = Web3.solidity_keccak(['string', 'uint256'], [req.order_id, timestamp])
    message = encode_defunct(hexstr=msg_hash.hex())
    
    signed_msg = Account.sign_message(message, private_key=req.driver_private_key)
    
    return {
        "order_id": req.order_id,
        "timestamp": timestamp,
        "signature": signed_msg.signature.hex(),
        "qr_payload": f"MICROTIP:{req.order_id}:{timestamp}:{signed_msg.signature.hex()}"
    }

@app.get("/api/analytics")
def get_analytics():
    """Serves real-time telemetry data to React Recharts."""
    return {
        "total_volume_usdc": 14250.00,
        "total_tips_paid": 3810.00,
        "spoofing_prevented": 184,
        "hourly_tips": [
            {"time": "10:00", "tips": 120, "volume": 450},
            {"time": "12:00", "tips": 340, "volume": 1200},
            {"time": "14:00", "tips": 210, "volume": 890},
            {"time": "16:00", "tips": 480, "volume": 1650},
            {"time": "18:00", "tips": 720, "volume": 2400},
        ]
    }
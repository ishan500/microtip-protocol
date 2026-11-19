# ⚡ MicroTip Protocol

**Zero-fee, instant USDC micro-tipping for delivery drivers on Polygon—secured by a 2km Haversine GPS geofence and ephemeral ECDSA QR handshakes.**

---

## 📖 Overview

Traditional delivery platforms charge 15%–30% in intermediary fees and delay tip payouts for days. **MicroTip** eliminates middlemen by locking consumer tips inside a smart contract escrow vault on the **Polygon Amoy Testnet** and releasing 100% of the funds directly to the driver's wallet in ~1.2 seconds upon verified physical arrival.

To prevent remote payout fraud and GPS spoofing, MicroTip enforces a **dual-factor physical proof mechanism**:
1. **2km Haversine GPS Geofence:** Verifies neighborhood-level proximity between the driver and customer before unlocking the settlement flow.
2. **Ephemeral QR Cryptographic Handshake:** Requires scanning a single-use `secp256k1` ECDSA-signed QR code rendered on the driver's screen at the doorstep.

---

## ✨ Key Features

* **Multi-Role Live Simulation:** Switch seamlessly between **Platform Admin**, **Driver**, and **Consumer** profiles with persistent state and dynamic user onboarding.
* **Interactive 2km Pune Geofence Map:** Powered by React-Leaflet with real-time driver tracking, dynamic radius validation, and visual state transitions:
  * 🟡 **Dashed Amber (`> 2 km`):** Driver en route; escrow funds locked in monitoring state.
  * 🟢 **Solid Green (`≤ 2 km`):** City proximity verified; QR handshake unlocked for settlement.
  * 🔴 **Anti-Spoofing Block (`> 2 km` scan attempt):** Rejects forged or out-of-bounds ECDSA signatures, freezes escrow, and logs prevented attacks.
* **Driver Earnings Hub:** Displays live USDC balance and generates ephemeral proximity QR codes for doorstep verification.
* **Admin Analytics & Fleet Management:** Tracks Total Escrow Volume, Real-Time Tip Volume, Average Settlement Speed, Prevented Spoofing Attacks, and online/offline fleet status.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Recharts, React-Leaflet (Stadia Maps Dark)
* **Backend:** Python, FastAPI, Uvicorn
* **Blockchain & Security:** Polygon Amoy Testnet (Chain ID: `80002`), USDC Escrow Smart Contract, Haversine Distance Calculation, `secp256k1` ECDSA Signature Verification

---

## 📂 Project Structure

```text
microtip-protocol/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── DeliveryMap.jsx    # Interactive Leaflet map & 2km geofence logic
│   │   ├── App.jsx                # Role switcher, KPIs, QR handshake & anti-spoofing UI
│   │   └── main.jsx
│   └── package.json
├── backend/
│   └── main.py                    # FastAPI server & Haversine/ECDSA verification endpoints
├── .gitignore
└── README.md

Getting Started
Prerequisites
Node.js (v18+)

Python (v3.10+)

1. Start the FastAPI Backend
Bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
API interactive docs available at http://127.0.0.1:8000/docs.

2. Start the React Frontend
Bash
cd frontend
npm install
npm run dev
Open the local URL shown in your terminal (typically http://localhost:5173).

🧪 Demo Walkthrough
Platform Admin View: Inspect live escrow volume, transaction history, and active drivers on the Pune map. Click Test Anti-Spoofing Defense to simulate a remote GPS spoofing attempt.

Driver View: Switch to a Driver account via the top-right profile switcher to view the live USDC balance and ephemeral QR code.

Consumer View: Switch to a Consumer account, set a tip amount, and drag the Simulate Driver Proximity slider:

Slide above 2000m (Red/Amber state) and click Scan Driver Handshake QR to verify that out-of-bounds payouts are rejected.

Slide below 2000m (Green state) and click Scan Driver Handshake QR to settle the tip on-chain and update the ledger in real time.

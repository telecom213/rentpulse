# RentPulse — Fully Automated Telecom & Computer Rental Website

## Overview
A complete, self-contained prototype of a modern product rental platform specialized in:
- Computers (laptops, workstations)
- Mobile devices (phones, tablets)
- Networking equipment (switches, APs, routers)
- Servers
- Telecom gear (VoIP phones, fiber OTDR testers)

### Key "Fully Automated" Features Implemented
- **Live Dynamic Pricing Engine** — prices fluctuate based on simulated demand
- **Real-time Inventory Simulation** — stock levels update automatically every ~12s
- **AI Chatbot (PulseAI)** — keyword-driven smart assistant for product recommendations, pricing, delivery, tracking
- **Automated Cart & Checkout** — full rental configuration (duration, qty, insurance, free bulk delivery)
- **One-click order processing** — generates order ID and simulates dispatch
- **Live Ops Dashboard** — metrics for stock, active rentals, revenue, auto-orders
- **Responsive dark cyber-tech UI** with glassmorphism and pulse effects
- **LocalStorage cart persistence**

## How to Run Locally
1. Clone the repo
2. Open a terminal in the root
3. Run: `python -m http.server 8080`
4. Open http://localhost:8080 in your browser

No backend required — pure frontend with mock automation.

## Tech Stack (Prototype)
- HTML5 + CSS3 (custom design system)
- Vanilla JavaScript (modular rental engine)
- Inter font + generated product imagery
- No external frameworks (lightweight & portable)

## Production Roadmap (if scaling)
- Next.js / React frontend
- Node.js or Django backend + PostgreSQL
- Stripe + Stripe Connect for payments
- Real inventory management
- IoT tracking
- Full LLM chatbot
- Multi-warehouse allocation engine

## Brand
**RentPulse** — "Rent Smarter. Power Faster."

© 2026 RentPulse Demo | Built for ByteMe / telecom213

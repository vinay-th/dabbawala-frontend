# Dabbawala Protocol

**Bounded-authority operating layer for simulated delivery robots.**

> **This is a simulation.** Physical city, robots, and human identities are simulated. Permission, payment, and audit layers are cryptographically live on testnets.

## Overview

Dabbawala Protocol gives every robot a public passport (ENSv2 on Sepolia), a spending limit it cannot raise, and a stop button it cannot ignore. The protocol demonstrates:

- **ENSv2**: Public identity with scoped permissions on Sepolia
- **Hedera x402**: Metered payments for route intel
- **0G Compute**: Verified AI decisions with cryptographic request IDs
- **0G Storage**: Immutable episode logs anchored on 0G Chain

## Project Structure

```
dabbawala/
├── dabbawala-frontend/  # Next.js 16 dashboard (Landing + Console)
│   ├── src/app/page.tsx           # Landing page scroll story
│   ├── src/app/console/page.tsx   # Mission control interface
│   ├── src/app/console/services/consoleApi.ts  # Backend API boundary
│   └── ...
│
└── dabbawala-backend/  # Fastify TypeScript API
    ├── apps/api/src/          # API routes
    ├── packages/zero-g-adapter/ # 0G integration
    ├── packages/hedera-sdk/   # Hedera x402 payment
    ├── packages/config/       # Environment configuration
    └── ...
```

## Getting Started

### Prerequisites
- Node.js 22.x
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp dabbawala-frontend/.env.example dabbawala-frontend/.env
cp dabbawala-backend/.env.example dabbawala-backend/.env

# Configure .env files with your testnet credentials:
# - Sepolia RPC URL
# - ENS resolver addresses (or leave blank for simulation)
# - 0G Router API key
# - Hedera testnet account IDs and keys
```

### Running the Application

```bash
# Terminal 1: Start backend API
cd dabbawala-backend
pnpm dev

# Terminal 2: Start frontend
cd dabbawala-frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.
Open [http://localhost:3000/console](http://localhost:3000/console) for the mission control.

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /v1/health` | Liveness probe |
| `GET /v1/ready` | Readiness check |
| `GET /v1/console/scenarios` | Test scenarios |
| `GET /v1/robots/:id/passport` | Robot ENS passport (live data) |
| `POST /v1/gate/decide` | Human gate approval |
| `POST /v1/internal/spend/buy-intel` | Spend Controller buys route intel via x402 |

## Live Demo

- **Frontend**: http://localhost:3000
- **Console**: http://localhost:3000/console
- **Backend API**: http://localhost:3001

### What is Live

- ENSv2 name resolution and text records
- 0G Router decisions with TEE verification
- Hedera x402 payment flow (via Spend Controller)
- 0G Storage episode logs (in-memory fallback)
- Smart contract interactions

### What is Simulated

- Physical city layout and Mumbai landmarks
- Robot hardware and movement physics
- Human identities and approval process (mocked)
- Route data and traffic conditions

## Test Case Generator

The judges can click **"Surprise Me"** on the console to generate a random test case. The test case will have a random outcome:
- **DELIVERED**: All robots complete their routes successfully
- **REROUTED**: 0G detects a hazard and reroutes robots
- **HALTED**: A policy gate or spend controller decision stops a robot
- **REFUSED**: A payment is refused due to budget or cap limits

The test case generator ensures varied outcomes for each run, providing evidence of the protocol's robustness under different conditions.

## Contributing

See [REFERENCES.md](dabbawala-backend/REFERENCES.md) for verified technical references.

## License

MIT
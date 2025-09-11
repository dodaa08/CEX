## Minimal CEX-like Deposits, Indexing, and API 🚀

A small, focused project that issues per-user deposit addresses, indexes on-chain activity, and exposes simple APIs your frontend can use to behave like a lightweight CEX.

### What this repo contains
- **BE**: Express + MongoDB API for signup/auth and getting deposit addresses.
- **Indexer**: EVM block listener (ethers v6) + Redis + MongoDB. Tracks deposits for “interested addresses” and updates user balances.

---

## Architecture
```
            ┌──────────────────────────────────┐
            │            Frontend              │
            │  (login, show address, balance) │
            └───────────────┬──────────────────┘
                            │ REST
                            ▼
                    ┌──────────────┐
                    │     BE       │
                    │  Express API │
                    └──────┬───────┘
                           │ Mongo (Users)
                           ▼
                     ┌────────────┐
                     │  MongoDB   │
                     └────────────┘
                           ▲
                           │ writes (balances)
   Redis (checkpoint, addr cache)  │
         ┌──────────────────┐      │
         │      Redis       │◄─────┘
         └────────┬─────────┘
                  │
                  ▼
           ┌──────────────┐    EVM RPC
           │   Indexer    │────────────► Provider
           │  (ethers v6) │    (Sepolia/Mainnet)
           └──────────────┘
```

---

## How the Indexer works (high-level)
1) Load "interested addresses" (deposit addresses) from MongoDB. Cache them in Redis.
2) Read last processed block from Redis (checkpoint). If none, start at current head.
3) On each new block:
   - Fetch full transactions for that block in one call.
   - Filter txs where `from` or `to` matches an interested address (normalized lowercase).
   - For each relevant address: fetch balance via provider and upsert to Mongo; also cache results in Redis.
   - Save the processed block number back to Redis.

### Key modules (Indexer)
- `src/config/block.ts`
  - `processBlock(blockNumber, addresses)` – fetch block with full transactions (1 RPC), filter for relevant addresses, update balances.
  - `startBlockListener(addresses)` – subscribe to new blocks, process sequentially with catch-up logging, save checkpoints.
- `src/services/addresses.ts`
  - `LoadInteresetdAddresses()` – load deposit addresses from Mongo, normalize to lowercase, cache in Redis.
- `src/services/bloclService.ts`
  - `getLastProcessedblock()` / `setLastProcessedBlock(n)` – checkpoint helpers stored in Redis.
- `src/services/Updatedb.ts`
  - `check_balance_update_db(address)` – get on-chain balance, compare with DB, update if changed, cache in Redis.

---

## Backend (BE) – Routes & behavior
- `POST /api/auth/signup`
  - Creates a new user: derives a unique deposit address (HD path), stores `email`, `DepositAddress`, `userId`, `privateKey`, and initial `balance`.
  - Invalidates Redis key `interested_addresses` so the indexer reloads the new address.
- `GET /api/getAddress`
  - Returns the user's deposit address (implementation lives under `routes/DepositAddress`).
- `GET /health`
  - Liveness endpoint.

## Environment
Create `.env` files for BE and Indexer with at least:
```
ETH_RPC_URL=...          # e.g., https://sepolia.infura.io/v3/<key>
MONGO_DB_CONNECTION=...  # e.g., mongodb://localhost:27017/stake
REDIS_URL=redis://localhost:6379
PORT=5000                # for BE
```

---

## Running locally
1) Infra (one-time):
```
docker run -d --name mongo -p 27017:27017 mongo:7
docker run -d --name redis -p 6379:6379 redis:7
```

2) Backend:
```
cd BE
npm i
npm run dev
```

3) Indexer:
```
cd indexer
npm i
npm run dev
```

---

## Frontend (Next.js) 🔐
- **Next.js 14** with TypeScript and Tailwind CSS
- **Authentication**: Signup/login with email/password
- **Dashboard**: Show user's deposit address and current balance
- **Real-time updates**: Poll BE APIs to reflect balance changes detected by indexer
- **Transaction history**: Display relevant transactions for user's addresses
- **Withdrawal flow**: Send funds from deposit address (requires private key management)

### Key features
- After signup/login, show the user's on-chain deposit address
- Poll `GET /api/getAddress` and `GET /api/balance` to show updated balances
- When user sends funds to deposit address, indexer detects it and updates Mongo; FE reflects changes within a block or two
- For withdrawals, extend BE with proper auth, signing policies, and on-chain send flows

---


## Roadmap (short)
- Add `GET /api/balance` and `/api/txs` for the FE
- Rename `bloclService.ts` → `blockService.ts` for consistency
- Add input validation, rate limiting, and structured logging
- Implement secure private key management for withdrawals



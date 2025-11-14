# Job Import System Scalable — README

## Overview
The **Job Import System** is a fully scalable, queue‑driven ETL pipeline that fetches job feeds from multiple external XML APIs, converts the data into JSON, stores the jobs into MongoDB using queue architecture, and tracks import history. The system includes:

- A **Node.js Express server** with background job producers
- A **Fetcher + Cron scheduler** (runs every 1 hour by default)
- A **Redis-powered BullMQ Queue**
- A **Worker service** that call the fetch service and imports jobs into MongoDB
- A **Next.js Dashboard UI** for monitoring of the events realtime
- **Socket.IO realtime updates**
- **Detailed Import Logs** for tracking insert/update failures

This README provides full instructions for **setup**, **running**, **configuration**, **testing**, and **usage**.

---

# Features
- Fetch jobs from multiple XML feeds
- Cron-based automated importing (default: **every 1 hour**)
- XML → JSON conversion using `xml2js`
- Queue-based processing using **BullMQ + Redis**
- Concurrent worker processing with configurable concurrency
- Bulk MongoDB upsert (fast + idempotent)
- Import History tracking (`import_logs` collection)
- Next.js Dashboard
- Socket.IO realtime updates for the client

---

# Project Structure
```
/server              → Node.js (API + Cron + Queue Producer)
/server/src          → Server source code
/server/src/tests    → tests for the APIs
/client              → Next.js UI page for monitor
/docs                → Architecture documents + data flow diagram files
```

---


# Setup Instructions

## 1. Clone the repository
```bash
git clone https://github.com/harshitHash2/importscalablesystem.git
cd importscalablesystem
```

---

## ⚙️ 2. Setup Environment Variables
Create a new file or rename env.example to .env `/server/.env` with:

```env
# Mongo
MONGO_URI=mongodb://mongo:27017/job_importer



# For Redis Cloud
# REDIS_HOST=redis-xxxx.cloud.redislabs.com
# REDIS_PORT=12345
# REDIS_USERNAME=default
# REDIS_PASSWORD=xxxxx
# REDIS_TLS=true

# Server
PORT=4000
ENABLE_REALTIME=true
QUEUE_NAME=job-import-queue

# Worker
WORKER_CONCURRENCY=3
BATCH_SIZE=20
JOB_ATTEMPTS=5
JOB_BACKOFF_MS=1000

# Cron schedule (default every 1 hour)
JOB_FETCH_CRON=*1 * * * *
```


### Access:
- **Next.js UI** → http://localhost:3000
- **API Server** → http://localhost:4000
- **API Test check** → http://localhost:4000/api/health

---

# 4. Running Without Docker (Local Mode)

### Terminal A — Start Server
```bash
cd server
npm install
npm run dev
```

### Terminal B — Start Client
```bash
cd client
npm install
npm run dev
```

---

# Usage

## Automatic Import (Cron)
The cron runs every hour (you can change it in crons service ) and automatically enqueues all predefined urls. No manual action needed.

## Manual Import
Send a POST request:
```bash
POST http://localhost:4000/api/import/import
Content-Type: application/json

{
  "urls": ["https://jobicy.com/?feed=job_feed"]
}
```
Response:
```json
{ "queued": 1 }
```

## View Import Logs (Admin UI)
Navigate to:
```
http://localhost:3000
```
You will see:
- Feed URL
- Total jobs processed
- New jobs
- Updated jobs
- Failed jobs
- Timestamp
- Realtime updates

## API Endpoints
**GET /api/logs** → List logs  
**POST /api/import/import** → Manually queue the url into MQ 
**GET /api/health** → API check point

---

# Running Tests (Jest + Supertest)

### Tests live inside `/server/src/tests`.

## 1. Start the server
```bash
cd server
npm run dev
```

## 2. Run tests
```bash
npm run test
```

### Ensure to check before starting test:
```bash
npm install --save-dev cross-env
```
And test script in `package.json` of the server:
```json
"test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --runInBand"
```

---

# Configuration
All configurable via `.env`:

| `WORKER_CONCURRENCY` | Number of concurrent processed feeds |
| `BATCH_SIZE` | How many job items per bulkWrite |
| `JOB_ATTEMPTS` | Retry attempts per feed job |
| `JOB_BACKOFF_MS` | Exponential backoff delay |
| `JOB_FETCH_CRON` | Cron schedule |
| `REDIS_*` | Redis Cloud config |
| `MONGO_URI` | MongoDB connection |

---

# Deployment

## Frontend (Next.js)
Deploy to **Netlify or Vercel** with environment variable:
```


## Backend (Node.js)
Deploy to:
- Render
- Heroku
- AWS ECS


Use environment variables for MongoDB and Redis.

## Databases
- MongoDB Atlas
- Redis Cloud

---

# Scaling
- Add more **workers** for parallel processing
- Use Redis Cloud for high throughput
- Deploy workers and server separately for microservices

---

# Security
- Never commit `.env` files
- Use TLS for Redis Cloud (`REDIS_TLS=true`) you can add this in env and add in the connection options
- Use MongoDB Atlas IP allowlist

---



# Documentation
See:
```
/docs/architecture.md
```
Contains:
- System Architecture
- Design Decisions
- Diagrams
- Scaling discussions

---

# Conclusion
The **Job Import System** is a fully scalable, production‑ready system and processing pipeline with logs, realtime updates, and monitoring data. The architecture enables easy break down into microservices and cloud-based architect.

If you need help customizing or extending any part of the system — just ask!


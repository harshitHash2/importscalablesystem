# Job Import System — Architecture & Implementation Details

## Overview
The Job Import System schedules the insertion of job items from various third-party XML feeds, transforms them into JSON, and stores them in MongoDB. Data ingestion and processing are separated by a Redis-backed queue (BullMQ). A worker service uses retry/backoff logic and batch sizes that can be adjusted to process jobs concurrently. A Next.js Admin UI shows import status and real-time updates, and import history is recorded.

## High-Level Flow
1. Cron scheduler triggers every hour and enqueues feed URLs.
2. Node.js server receives cron events and manually triggered actions.
3. Feed URLs are enqueued into Redis using BullMQ.
4. Worker process dequeues jobs, fetches XML data, parses, normalizes, and insert/update data in MongoDB.
5. Worker creates an import history log.
6. Worker emits Socket.IO events to the Next.js UI for realtime updates.
7. Next.js Admin UI displays all import logs, allows manual imports just to try.

## Components & Responsibilities
### External Data Sources
- XML job feeds from various urls.
- Provide XML data which is converted to JSON data.

### Node.js Server
- Hosts Express API endpoints.
- Cron Scheduler (every 1 hour).
- Fetcher: Enqueues URLs to Redis.
- Queue Producer for BullMQ.
- Socket.IO server for realtime events.

### Redis Queue (BullMQ)
- Stores background jobs url for feed imports.
- Provides retry logic, concurrency control, and job isolation.

### Worker Process
- Dequeue jobs.
- Fetches XML data via Axios.
- Converts XML → JSON (using xml2js).
- Minimalize items and performs batch inserts via MongoDB bulkWrite.
- Computes new/updated/failed counts.
- Inserts an ImportLog record.
- Emits Socket.IO events.

### MongoDB / Atlas
- `jobs` collection: Stores job details.
- `import_logs` collection: Stores import history.
- Index on jobId ensures idempotency.

### Next.js Admin UI
- Displays interactions in a dashboard.
- Fetches logs via REST APIs.
- Receives realtime Socket.IO updates.

### Socket.IO (Realtime)
- Worker sends progress updates.
- UI receives live notifications when imports complete.

## Data Models
### Job Model
- jobId (unique)
- title 
- company
- location
- description
- link
- raw JSON copy

### ImportLog Model
- url
- totalFetched
- newJobs
- updatedJobs
- failedJobs
- failedDetails
- timestamp

## API Endpoints
### `POST /api/import/import`
Manually enqueue URLs.

### `GET /api/logs`
Fetch import history.

### `GET /api/health`
Just to Check the connection.

## Configuration ( SERVER ENV)
- MONGO_URI
- REDIS_HOST
- REDIS_PORT
- REDIS_USERNAME
- REDIS_PASSWORD
- PORT
- QUEUE_NAME
- WORKER_CONCURRENCY
- BATCH_SIZE
- JOB_ATTEMPTS
- JOB_BACKOFF_MS
- ENABLE_REALTIME


## XML → JSON Parsing
- Convert XML via xml2js.
- Normalize fields.
- Store raw payload.

## Batch Processing & Bulk Write
- Convert normalized jobs into bulkWrite operations.

## Idempotency
- Unique index on jobId prevents duplicates.
- bulkWrite ensures insert-or-update consistency.

## Retry & Backoff
- BullMQ with exponential backoff.
- Worker throws errors for retryfailures.

## Failure Handling
- Detailed entry saved with failed items details in ImportLog.
- Worker and queue logs monitored.

## Scaling
- Add more workers for parallel processing.
- Use Redis Cloud for distributed queues.
- Use MongoDB Atlas for managed scaling.

## Deployment
- Docker Compose for local.
- Vercel for Next.js.
- Render/Railway/Heroku for Node.js server.

## Future Improvements
- Dead-letter queue implementation for failures items.
- Dead-letter queue refinement according to the system need
- Per-item retry management.
- Some Authentication for admin UI.
- Structured logging & metrics exposure and dashboards.

## Diagram

`![Architecture Diagram](/systemdesign.png)`


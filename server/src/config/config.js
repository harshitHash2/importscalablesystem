import dotenv from 'dotenv';
dotenv.config();


export default {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/job_importer',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  REDIS_USERNAME: process.env.REDIS_USERNAME || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',



  PORT: Number(process.env.PORT || 4000),
  QUEUE_NAME: process.env.QUEUE_NAME || 'job-import-queue',
  WORKER_CONCURRENCY: Number(process.env.WORKER_CONCURRENCY || 3),
  BATCH_SIZE: Number(process.env.BATCH_SIZE || 20),
  JOB_ATTEMPTS: Number(process.env.JOB_ATTEMPTS || 3),
  JOB_BACKOFF_MS: Number(process.env.JOB_BACKOFF_MS || 1000),
  ENABLE_REALTIME: process.env.ENABLE_REALTIME === 'true'
};

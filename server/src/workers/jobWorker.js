import { Worker } from "bullmq";
import IORedis from "ioredis";
import config from "../config/config.js";
import { fetchJobsFromUrl } from "../services/fetchJobs.service.js";
import JobModel from "../models/Job.js";
import ImportLogModel from "../models/ImportLog.js";

// const connection = new IORedis({ host: config.REDIS_HOST, port: config.REDIS_PORT });

const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  username: config.REDIS_USERNAME,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null,

};

// if (config.REDIS_USERNAME) connectionOptions.username = config.REDIS_USERNAME;
// if (config.REDIS_PASSWORD) connectionOptions.password = config.REDIS_PASSWORD;
// if (config.REDIS_TLS) connectionOptions.tls = {}; // enables TLS/SSL

const connection = new IORedis(connectionOptions);

function createArrayOfBatchSize(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function startWorker() {
  console.log("Starting worker");
  const worker = new Worker(
    config.QUEUE_NAME,
    async (job) => {
      const { url } = job.data;

      const items = await fetchJobsFromUrl(url);
      const totalFetched = items.length;
      let newJobs = 0,
        updatedJobs = 0;
      const failedDetails = [];

      const batches = createArrayOfBatchSize(items, config.BATCH_SIZE);

      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi];
        const ops = batch.map((item) => ({
          updateOne: {
            filter: { jobId: item.jobId },
            update: {
              $set: {
                title: item.title,
                company: item.company,
                location: item.location,
                description: item.description,
                link: item.link,
                raw: item.raw,
              },
            },
            upsert: true,
          },
        }));

        try {
          const res = await JobModel.bulkWrite(ops, { ordered: false });
          if (res && res.upsertedCount) newJobs += res.upsertedCount;

          updatedJobs += batch.length - (res.upsertedCount || 0);
        } catch (err) {
          for (const it of batch) {
            try {
              const r = await JobModel.updateOne(
                { jobId: it.jobId },
                {
                  $set: {
                    title: it.title,
                    company: it.company,
                    location: it.location,
                    description: it.description,
                    link: it.link,
                    raw: it.raw,
                  },
                },
                { upsert: true }
              );
              if (r.upsertedCount && r.upsertedCount > 0) newJobs++;
              else updatedJobs++;
            } catch (e) {
              failedDetails.push({ itemId: it.jobId, reason: e.message });
            }
          }
        }

        const progress = Math.round(((bi + 1) / batches.length) * 100);
        await job.updateProgress(progress);
        if (global.io) global.io.emit("import_progress", { url, progress });
      }

      const totalImported = newJobs + updatedJobs;
      const log = await ImportLogModel.create({
        url,
        fileName: url,
        totalFetched,
        totalImported,
        newJobs,
        updatedJobs,
        failedJobs: failedDetails.length,
        failedDetails,
        timestamp: new Date(),
      });
      if (global.io) global.io.emit("import_log", log);
      return { logId: log._id };
    },
    { connection, concurrency: config.WORKER_CONCURRENCY }
  );

  worker.on("failed", (job, err) => {
    console.error(
      "worker failed",
      // job,
      job.id,
      err && err.message
    );
  });
  console.log("worker started");
}

import cron from "node-cron";
import { enqueueFeed } from "../queue/queue.service.js";
import config from "../config/config.js";

const JOB_FEED_URLS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

// Start cron scheduler
export function startJobFetchCron() {
  const schedule = '0 * * * *'; //you can change it at your convenience
  //"*/1 * * * *";
  //'0 * * * *'; 
  // console.log(`Starting cron (${schedule})`);

  cron.schedule(schedule, async () => {
    console.log("job fetch cron", new Date().toISOString());
    try {
      for (const url of JOB_FEED_URLS) {
        console.log(1);
        await enqueueFeed(url);
      }
      console.log("Jobs queued");
    } catch (err) {
      console.error("Error job:", err.message);
    }
  });
}

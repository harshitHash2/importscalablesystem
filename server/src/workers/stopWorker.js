import IORedis from 'ioredis';
import config from '../config/config.js';

// const connection = new IORedis({ host: config.REDIS_HOST, port: config.REDIS_PORT });

const connectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  username: config.REDIS_USERNAME,
      password: config.REDIS_PASSWORD,
      maxRetriesPerRequest: null
};



const connection = new IORedis(connectionOptions);

export async function stopWorker() {
  console.log('Stopping worker**********');
  try {
    if (worker) await worker.close();
    await clearBullMQQueues();
    await connection.quit();
    console.log('data cleared');
  } catch (err) {
    console.error('Error stopping worker:', err.message);
  }
}

// async function clearBullMQQueues() {
//   const pattern = `bull:${config.QUEUE_NAME}:*`;
//   const keys = await connection.keys(pattern);
//   if (keys.length > 0) {
//     await connection.del(keys);
//     console.log('Deleted keys',keys.length);
//   } else {
//     console.log('No key');
//   }
// }
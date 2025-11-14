import mongoose from 'mongoose';
const ImportLogSchema = new mongoose.Schema({
  url: String,
  fileName: String,
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: Number,
  failedDetails: [{ itemId: String, reason: String }],
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model('ImportLog', ImportLogSchema);
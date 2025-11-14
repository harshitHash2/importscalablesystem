import mongoose from 'mongoose';
const JobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true, required: true, index: true },
  title: String,
  company: String,
  location: String,
  description: String,
  link: String,
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });
export default mongoose.model('Job', JobSchema);

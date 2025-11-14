import express from "express";
import ImportLog from "../models/ImportLog.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const logs = await ImportLog.find()
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await ImportLog.countDocuments();
  res.json({ logs, total });
});

// router.get("/:id", async (req, res) => {
//   const log = await ImportLog.findById(req.params.id);
//   if (!log) return res.status(404).send({ error: "not found" });
//   res.json(log);
// });

export default router;

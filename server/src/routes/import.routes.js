import express from "express";
import { enqueueFeed } from "../queue/queue.service.js";
const router = express.Router();

router.post("/import", async (req, res) => {
  try {
    console.log("Import request", req.body);
    const { urls } = req.body;
    if (!Array.isArray(urls))
      return res.status(400).json({ error: "urls must be an array" });
    const results = [];
    for (const u of urls) {
      results.push(await enqueueFeed(u));
    }
    res.json({ queued: results.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

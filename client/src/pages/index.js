import { useEffect, useState } from "react";
import io from "socket.io-client";

const API = process.env.API_URL || "http://localhost:4000";
const WS = process.env.WS_URL || "http://localhost:4000";

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [queuedUrl, setQueuedUrl] = useState(
    "https://jobicy.com/?feed=job_feed"
  );
  useEffect(() => {
    fetchLogs();
    const socket = io(WS);
    socket.on("import_progress", (data) => {
      if (data.progress === 100) fetchLogs();
    });
    socket.on("import_log", (log) => {
      fetchLogs();
    });
    return () => socket.disconnect();
  }, []);

  async function fetchLogs() {
    console.log("Fetching logs", API);
    try {
      const res = await fetch(`${API}/api/logs?page=${page}&limit=20`);
      console.log("Logs response:", res);
      const json = await res.json();
      setLogs(json.logs || []);
    } catch (err) {
      console.log(err);
      setLogs([]);
    }
  }

  async function handleQueue() {
    try {
      await fetch(`${API}/api/import/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [queuedUrl] }),
      });

      fetchLogs();
    } catch (err) {
      console.error("Failed to queue import", err);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Import History</h1>
      <div className="d-flex gap-3" style={{ marginBottom: 12 }}>
        <input
          className="form-control"
          style={{ width: 480, padding: 8 }}
          value={queuedUrl}
          onChange={(e) => setQueuedUrl(e.target.value)}
        />
        <button
          className="btn btn-success"
          onClick={handleQueue}
          style={{ marginLeft: 8, padding: "8px 12px" }}
        >
          Queue Import
        </button>
      </div>
      <table
        className="table"
        border="1"
        cellPadding="6"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>File (URL)</th>
            <th>Total</th>
            <th>New</th>
            <th>Updated</th>
            <th>Failed</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td
                style={{
                  maxWidth: 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l.fileName}
              </td>
              <td>{l.totalFetched}</td>
              <td>{l.newJobs}</td>
              <td>{l.updatedJobs}</td>
              <td>{l.failedJobs}</td>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import request from "supertest";

const API = "http://localhost:4000";

describe("Server checking", () => {
  it("respond to /api/health", async () => {
    const res = await request(API).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("respond to /api/logs", async () => {
    const res = await request(API).get("/api/logs");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("logs");
  });

  it("respond to /api/import/import", async () => {
    const res = await request(API)
      .post("/api/import/import")
      .send({ urls: ["https://jobicy.com/?feed=job_feed"] });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("queued");
  });
});

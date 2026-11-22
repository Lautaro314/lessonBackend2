const request = require("supertest");
const { expect } = require("chai");
const app = require("../src/app.js");
const config = require("../src/config/env.config.js");

describe("Health check - /health", () => {
  it("devuelve estado, entorno, uptime y timestamp sin información sensible", async () => {
    const res = await request(app).get("/health");

    expect(res.status).to.equal(200);
    expect(res.body).to.have.all.keys("status", "environment", "uptime", "timestamp");
    expect(res.body.status).to.equal("ok");
    expect(res.body.environment).to.equal(config.mode);
    expect(res.body.uptime).to.be.a("number");
    expect(new Date(res.body.timestamp).toISOString()).to.equal(res.body.timestamp);
    expect(res.headers["cache-control"]).to.equal("no-store");
  });
});

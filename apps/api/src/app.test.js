import request from "supertest";
import app from "./app.js";

describe("api foundation", () => {
  it("returns the health payload without auth", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(typeof response.body.data.ts).toBe("string");
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await request(app)
      .post("/api/v1/echo")
      .set("Content-Type", "application/json")
      .send('{"bad": }');

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors[0].code).toBe("INVALID_JSON");
  });

  it("returns 413 for payloads over 10kb", async () => {
    const response = await request(app)
      .post("/api/v1/echo")
      .set("Content-Type", "application/json")
      .send({
        payload: "x".repeat(11 * 1024)
      });

    expect(response.statusCode).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.errors[0].code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("returns standardized 404 errors", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.errors[0].code).toBe("NOT_FOUND");
  });
});

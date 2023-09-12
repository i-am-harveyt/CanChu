import request from "supertest";
import app from "../app.js";

describe("POST /api/1.0/users/signup", () => {
  beforeAll(() => {
    // 在這裡啟用模擬定時器（如果需要的話）
    // app.listen(3000);
  });

  /* the successful request */
  test("should sign up a new user", async () => {
    const rand = Math.random() * (1 << 30);
    const data = {
      name: `Test-${rand}`,
      email: `Test-${rand}@test.com`,
      password: "test",
    };
    const res = await request(app).post("/api/1.0/users/signup").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("access_token");
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user.name).toBe(data.name);
    expect(res.body.data.user.email).toBe(data.email);
    expect(res.body.data.user.provider).toBe("native");
    expect(res.body.data.user.picture).toBeNull();
  });

  /* missing feild */
  test("missing field, should return 400", async () => {
    const data = {
      email: "Test-5@test.com",
      password: "test",
    };
    const res = await request(app).post("/api/1.0/users/signup").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(400);
  });

  /* duplicate email */
  test("duplicate email, should return 403", async () => {
    const data = {
      name: "test",
      email: "test@test.com",
      password: "test",
    };
    await request(app).post("/api/1.0/users/signup").send(data);
    const res = await request(app).post("/api/1.0/users/signup").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(403);
  });

  /* wrong email */
  test("wrong email, should return 403", async () => {
    const data = {
      name: "test",
      email: "test.test.com",
      password: "test",
    };
    const res = await request(app).post("/api/1.0/users/signup").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(403);
  });
});

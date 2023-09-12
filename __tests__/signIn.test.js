import request from "supertest";
import app from "../app.js";

describe("POST /api/1.0/users/signin", () => {
  beforeAll(() => {
    // 在這裡啟用模擬定時器（如果需要的話）
  });

  const RAND = Math.random() * (1 << 30);

  /* the successful request */
  test("native sign in, should return 200", async () => {
    const data = {
      provider: "native",
      email: `Test-${RAND}@test.com`,
      password: "test",
    };
    await request(app)
      .post("/api/1.0/users/signup")
      .send({
        name: `Test-${RAND}`,
        email: `Test-${RAND}@test.com`,
        password: "test",
      });
    const res = await request(app).post("/api/1.0/users/signin").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("access_token");
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toHaveProperty("id");
    expect(res.body.data.user).toHaveProperty("provider");
    expect(res.body.data.user).toHaveProperty("name");
    expect(res.body.data.user.email).toBe(data.email);
    expect(res.body.data.user.provider).toBe("native");
    expect(res.body.data.user).toHaveProperty("picture");
  });

  /* missing feild */
  test("Native Signin: missing provider, should return 400", async () => {
    const data = {
      email: `Test-${RAND}@test.com`,
      password: "test",
    };
    const res = await request(app).post("/api/1.0/users/signin").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(400);
  });
  test("Native Signin: missing email, should return 400", async () => {
    const data = {
      provider: "native",
      password: "test",
    };
    const res = await request(app).post("/api/1.0/users/signin").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(400);
  });
  test("Native Signin: missing password, should return 400", async () => {
    const data = {
      provider: "native",
      email: `Test-${RAND}@test.com`,
    };
    const res = await request(app).post("/api/1.0/users/signin").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(400);
  });

  /* wrong information */
  test("wrong email, should return 403", async () => {
    const data = {
      provider: "native",
      email: `Test-${RAND}@test.com`,
      password: "test1",
    };
    const res = await request(app).post("/api/1.0/users/signin").send(data);

    // 使用斷言確認回應的狀態碼和內容
    expect(res.status).toBe(403);
  });
});


const express = require("express");
const app = express();
const request = require('supertest');

// jest.mock("@prisma/client"); // 追加: PrismaClientのモックを使用する
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: {
          findUnique: jest.fn().mockResolvedValue({ userId: 1, name: "Alice" }),
        },
      };
    }),
  };
});

const handler = require('./users'); // ルートハンドラの実際のパスに置き換えてください
app.use(express.json());
app.use("/users", handler); // Prismaのモックをハンドラに渡します

describe('GET /user', () => {
  it('responds with 200 status code', async () => {
    const response = await request(app).get('/users?userId=1');
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    // 必要に応じてモックデータの検証を追加
    expect(response.body.userId).toBe(1); // 追加: userIdの値を検証
  });
});

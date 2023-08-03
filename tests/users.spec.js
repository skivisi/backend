
const express = require("express");
const app = express();
const request = require('supertest');

// モックデータ
const mockUser = {
  userId: 1,
  // その他のユーザーのプロパティ
};

let prisma;

beforeAll(() => {
  // Prismaのモックを作成
  prisma = new PrismaClient();
  prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

  // グローバルオブジェクトにPrismaをセット
  global.prisma = prisma;

  // あなたのルートハンドラ
  const handler = require('../routes/users'); // ルートハンドラの実際のパスに置き換えてください

  app.use(express.json());
  app.use("/users", handler); // Prismaのモックをハンドラに渡します
});

const handler = require('./users'); // ルートハンドラの実際のパスに置き換えてください
app.use(express.json());
app.use("/users", handler); // Prismaのモックをハンドラに渡します

describe('GET /user', () => {
  it('responds with 200 status code', async () => {
    const response = await request(app).get('/users?userId=1');
    console.log(response.error)
    expect(response.statusCode).toBe(200);
    // 必要に応じてモックデータの検証を追加
    expect(response.body.userId).toBe(1); // 追加: userIdの値を検証
  });
});

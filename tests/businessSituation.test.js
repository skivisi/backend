const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma,
  };
});

const handler = require("../routes/businessSituation");
app.use(express.json());
app.use("/businessSituation", handler);

describe("PUT /:userId", () => {
  it("updates user's businessSituation successfully", async () => {
    // テスト用のデータ
    const mockUserId = 1;
    const mockBusinessSituation = "アサイン中";
    let mockUpdatedUser = {
      userId: 1,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    };

    // Prisma クライアントの update メソッドのモック実装
    // mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);
    mockPrisma.user.update.mockImplementation((query) => {
      if (query.where.userId === mockUpdatedUser.userId && mockBusinessSituation !== mockUpdatedUser.businessSituation) {
        return mockUpdatedUser = {
          userId: 1,
          email: "honda@gmail.com",
          employeeNumber: 5577,
          joinDate: "2022年7月",
          userName: "本田",
          affiliation: "CL",
          businessSituation: mockBusinessSituation,
          createdAt: "2023-05-22T01:33:55.690Z",
          updatedAt: "2023-05-22T01:33:55.690Z",
        };
      }
      return null;
    });


    // API のリクエストを送信
    const response = await request(app)
      .put(`/businessSituation/${mockUserId}`)
      .send({ businessSituation: mockBusinessSituation }) // 更新後の値を送信
      .expect(200);

    // レスポンスの検証
    expect(response.body).toEqual({
      affiliation: "CL",
      email: "honda@gmail.com",
      userName: "本田",
      joinDate: "2022年7月",
      employeeNumber: 5577,
      userId: 1,
      businessSituation:"アサイン中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: expect.any(String),
    });
    // Prisma クライアントの update メソッドが正しく呼び出されたか検証
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      data: { businessSituation: mockBusinessSituation, updatedAt: expect.any(Date) },
    });
  });

  it("500 status code on error", async () => {
    // Prisma クライアントの update メソッドのモック実装（エラーを返す）
    mockPrisma.user.update.mockRejectedValue(new Error("Prisma error"));

    // API のリクエストを送信
    const response = await request(app)
      .put(`/businessSituation/1`)
      .send({ businessSituation: "アサイン中" }) // 更新後の値を送信
      .expect(500);

    // レスポンスの検証
    expect(response.body.error).toBe("Prisma error");

    // Prisma クライアントの update メソッドが正しく呼び出されたか検証
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });
});

const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    autoCalibration: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma,
  };
});

const handler = require("../routes/autoCalibration");
app.use(express.json());
app.use("/autoCalibration", handler);


//自動補完のPOSTのテストケース
describe("POST /", () => {
  it("create autoCalibrations", async () => {
    // テスト用のリクエストボディデータ
    const requestBody = {
      autoCalibrations: [
        {
          skill: "React",
          category: 3,
          FR: 3,
          CL: 3,
          ML: 2,
          QA: 1,
          JAVA: 2,
          PHP: 3,
        },
        {
          skill: "SQL",
          category: 2,
          FR: 1,
          CL: 1,
          ML: 2,
          QA: 1,
          JAVA: 1,
          PHP: 3,
        },
      ],
    };

    // Prisma クライアントの createMany メソッドのモック実装
    mockPrisma.autoCalibration.createMany.mockResolvedValue([
      { ...requestBody.autoCalibrations[0] },
      { ...requestBody.autoCalibrations[1] },
    ]);

    // API のリクエストを送信
    const response = await request(app)
      .post("/autoCalibration")
      .send(requestBody)
      .expect(200);

    // レスポンスの検証
    expect(response.body.autoCalibrations).toHaveLength(2);
    expect(response.body.autoCalibrations[0].skill).toBe('React');
    expect(response.body.autoCalibrations[1].skill).toBe('SQL');


    // Prisma クライアントの createMany メソッドが正しく呼び出されたか検証
    expect(mockPrisma.autoCalibration.createMany).toHaveBeenCalledWith({
      data: requestBody.autoCalibrations.map((auto) => ({
        skill: auto.skill,
        category: auto.category,
        FR: auto.FR,
        CL: auto.CL,
        ML: auto.ML,
        QA: auto.QA,
        JAVA: auto.JAVA,
        PHP: auto.PHP,
      })),
    });
  });

  it("500 status code", async () => {
    // Prisma クライアントの createMany メソッドのモック実装（エラーを返す）
    mockPrisma.autoCalibration.createMany.mockRejectedValue(new Error("Prisma error"));
    // API のリクエストを送信
    const response = await request(app)
      .post("/autoCalibration")
      .send({ autoCalibrations: [] })
      .expect(500);

    // レスポンスの検証
    expect(response.body.error).toBe("Prisma error");

    // Prisma クライアントの createMany メソッドが正しく呼び出されたか検証
    expect(mockPrisma.autoCalibration.createMany).toHaveBeenCalled();
  });
});


//自動補完のGETのテストケース
describe("GET /get", () => {
  it("fetch autoCalibrations successfully", async () => {
    // テスト用のデータ
    const mockAutoCalibrations = [
      {
        id: 1,
        skill: "React",
        category: 3,
        FR: 3,
        CL: 3,
        ML: 2,
        QA: 1,
        JAVA: 2,
        PHP: 3,
      },
      {
        id: 2,
        skill: "SQL",
        category: 2,
        FR: 1,
        CL: 1,
        ML: 2,
        QA: 1,
        JAVA: 1,
        PHP: 3,
      },
    ];

    // Prisma クライアントの findMany メソッドのモック実装
    mockPrisma.autoCalibration.findMany.mockResolvedValue(mockAutoCalibrations);

    // API のリクエストを送信
    const response = await request(app).get("/autoCalibration/get").expect(200);

    // レスポンスの検証
    expect(response.body).toEqual(mockAutoCalibrations);
    // Prisma クライアントの findMany メソッドが正しく呼び出されたか検証
    expect(mockPrisma.autoCalibration.findMany).toHaveBeenCalled();
  });

  it("500 status code on error", async () => {
    // Prisma クライアントの findMany メソッドのモック実装（エラーを返す）
    mockPrisma.autoCalibration.findMany.mockRejectedValue(new Error("Prisma error"));

    // API のリクエストを送信
    const response = await request(app).get("/autoCalibration/get").expect(500);

    // レスポンスの検証
    expect(response.body.error).toBe("Failed to fetch autoCalibrations");

    // Prisma クライアントの findMany メソッドが正しく呼び出されたか検証
    expect(mockPrisma.autoCalibration.findMany).toHaveBeenCalled();
  });
});

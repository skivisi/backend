const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    request: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma,
  };
});

const handler = require("../routes/request");
app.use(express.json());
app.use("/request", handler);

//エンジニアがスペックシートの提出申請を出したときのテストケース
describe("POST /post", () => {
  it("created request object", async () => {
    const requestBody = {
      userId: 1,
      engineerComment: "開発経験を追加しました。",
    };

    const mockCreatedRequest = {
      userId: requestBody.userId,
      engineerComment: requestBody.engineerComment,
      status: 1,
      adminComment: "",
      adminId: 1,
      createdAt: new Date(),
      resultedAt: new Date(),
    };

    mockPrisma.request.create.mockResolvedValue(mockCreatedRequest);

    const response = await request(app)
      .post("/request/post")
      .send(requestBody)
      .expect(200);

    const createdRequest = response.body;
    // レスポンスの形式やデータの内容を適切に検証する
    expect(createdRequest).toEqual(
      expect.objectContaining({
        ...mockCreatedRequest,
        createdAt: mockCreatedRequest.createdAt.toISOString(),
        resultedAt: mockCreatedRequest.resultedAt.toISOString(),
      })
    );

    // Prismaのcreateメソッドが適切に呼び出されたかを検証する
    expect(mockPrisma.request.create).toHaveBeenCalledWith({
      data: {
        userId: requestBody.userId,
        status: 1,
        adminComment: "",
        engineerComment: requestBody.engineerComment,
        adminId: 1,
        createdAt: expect.any(Date),
        resultedAt: expect.any(Date),
      },
    });
  });

  it("should return an error if there is a server error", async () => {
    const requestBody = {
      userId: 1,
      engineerComment: "開発経験を追加しました。",
    };

    // サーバーエラーをシミュレートするため、Prismaのcreateメソッドがエラーをスローするようにする
    mockPrisma.request.create.mockRejectedValue(
      new Error("Database connection error")
    );

    const response = await request(app)
      .post("/request/post")
      .send(requestBody)
      .expect(500);

    const errorResponse = response.body;

    expect(errorResponse).toHaveProperty("error");
    expect(errorResponse.error).toBe("Database connection error");
  });
});

//管理者が提出申請を受け取るとき
describe("GET /request/accept", () => {
  it("accept", async () => {
    // モックのデータを設定する
    const mockApplications = [
      {
        applicationId: 1,
        userId: 1,
        engineerComment: "開発経験を追加しました",
        status: 1,
        adminComment: "",
        adminId: 1,
        createdAt: "2023-07-06T06:25:36.628Z",
        resultedAt: "2023-07-06T06:25:36.628Z",
      },
      {
        applicationId: 2,
        userId: 2,
        engineerComment: "よろしくお願いします",
        status: 1,
        adminComment: "",
        adminId: 1,
        createdAt: "2023-07-07T06:25:36.628Z",
        resultedAt: "2023-07-07T06:25:36.628Z",
      },
    ];

    // PrismaのfindManyメソッドをモック化して、モックのデータを返すようにする
    mockPrisma.request.findMany.mockResolvedValue(mockApplications);

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app).get("/request/accept").expect(200);
    const getRequest = response.body;

    // レスポンスの形式やデータの内容を適切に検証する
    expect(response.body).toEqual(
      expect.objectContaining([
        {
          applicationId: 1,
          userId: 1,
          engineerComment: "開発経験を追加しました",
          status: 1,
          adminComment: "",
          adminId: 1,
          createdAt: "2023-07-06T06:25:36.628Z",
          resultedAt: "2023-07-06T06:25:36.628Z",
        },
        {
          applicationId: 2,
          userId: 2,
          engineerComment: "よろしくお願いします",
          status: 1,
          adminComment: "",
          adminId: 1,
          createdAt: "2023-07-07T06:25:36.628Z",
          resultedAt: "2023-07-07T06:25:36.628Z",
        },
      ])
    );
  });

  it("requested applications", async () => {
    // PrismaのfindManyメソッドをモック化して、空の配列を返すようにする
    mockPrisma.request.findMany.mockResolvedValue([]);

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app).get("/request/accept").expect(200);

    // レスポンスのデータを検証する
    expect(response.body).toEqual(null);
  });

  it("should return an error if there is a server error", async () => {
    // PrismaのfindManyメソッドをモック化して、エラーをスローするようにする
    mockPrisma.request.findMany.mockRejectedValue(
      new Error("Database connection error")
    );

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app).get("/request/accept").expect(500);

    // レスポンスのエラーメッセージを検証する
    expect(response.body).toEqual({ error: "Database connection error" });
  });
});

//管理者による承認のテストケース
describe("PUT /approval/:applicationId", () => {
  it("updated request object", async () => {
    const applicationId = 1;
    const adminId = 2;

    let mockUpdatedRequest = {
      applicationId: 1,
      userId: 1,
      engineerComment: "開発経験を追加しました",
      status: 1,
      adminComment: "",
      adminId: 1,
      createdAt: new Date(),
      resultedAt: new Date(),
    };

    // mockPrisma.request.update.mockResolvedValue(mockUpdatedRequest);
    mockPrisma.request.update.mockImplementation((query) => {
      if (query.where.applicationId === mockUpdatedRequest.applicationId) {
        return (mockUpdatedRequest = {
          applicationId: 1,
          userId: 1,
          engineerComment: "開発経験を追加しました",
          status: 3,
          adminComment: "",
          adminId: adminId,
          createdAt: "2023-07-07T06:25:36.628Z",
          resultedAt: new Date(),
        });
      }
      return null;
    });

    const response = await request(app)
      .put(`/request/approval/${applicationId}`)
      .send({ adminId })
      .expect(200);

    const updatedRequest = response.body;

    // レスポンスの形式やデータの内容を適切に検証する
    expect(updatedRequest).toEqual(
      expect.objectContaining({
        ...updatedRequest,
        // createdAt: mockUpdatedRequest.createdAt.toISOString(),
        resultedAt: mockUpdatedRequest.resultedAt.toISOString(),
      })
    );

    // Prismaのupdateメソッドが適切に呼び出されたかを検証する
    expect(mockPrisma.request.update).toHaveBeenCalledWith({
      where: { applicationId: parseInt(applicationId) },
      data: {
        status: 3,
        adminId: adminId,
        resultedAt: expect.any(Date),
      },
    });
  });

  it("should return an error if there is a server error", async () => {
    const applicationId = "123";
    const adminId = 1;

    // サーバーエラーをシミュレートするため、Prismaのupdateメソッドがエラーをスローするようにする
    mockPrisma.request.update.mockRejectedValue(
      new Error("Database connection error")
    );

    const response = await request(app)
      .put(`/request/approval/${applicationId}`)
      .send({ adminId })
      .expect(500);

    const errorResponse = response.body;

    expect(errorResponse).toHaveProperty("error");
    expect(errorResponse.error).toBe("Database connection error");
  });
});

//管理者による否認のテストケース
describe("PUT /denial/:applicationId", () => {
  it("updated request object", async () => {
    const applicationId = 1;
    const adminId = 2;

    let mockUpdatedRequest = {
      applicationId: 1,
      userId: 1,
      engineerComment: "開発経験を追加しました",
      status: 1,
      adminComment: "",
      adminId: 1,
      createdAt: new Date(),
      resultedAt: new Date(),
    };

    // mockPrisma.request.update.mockResolvedValue(mockUpdatedRequest);
    mockPrisma.request.update.mockImplementation((query) => {
      if (query.where.applicationId === mockUpdatedRequest.applicationId) {
        return (mockUpdatedRequest = {
          applicationId: 1,
          userId: 1,
          engineerComment: "開発経験を追加しました",
          status: 2,
          adminComment: "アーキテクチャ図を追加して下さい。",
          adminId: adminId,
          createdAt: "2023-07-07T06:25:36.628Z",
          resultedAt: new Date(),
        });
      }
      return null;
    });

    const response = await request(app)
      .put(`/request/denial/${applicationId}`)
      .send({ adminId })
      .expect(200);

    const updatedRequest = response.body;
    // レスポンスの形式やデータの内容を適切に検証する
    expect(updatedRequest).toEqual(
      expect.objectContaining({
        ...updatedRequest,
        // createdAt: mockUpdatedRequest.createdAt.toISOString(),
        resultedAt: mockUpdatedRequest.resultedAt.toISOString(),
      })
    );

    // Prismaのupdateメソッドが適切に呼び出されたかを検証する
    expect(mockPrisma.request.update).toHaveBeenCalledWith({
      where: { applicationId: parseInt(applicationId) },
      data: {
        status: 2,
        adminId: adminId,
        resultedAt: expect.any(Date),
      },
    });
  });

  it("should return an error if there is a server error", async () => {
    const applicationId = "123";
    const adminId = 1;

    // サーバーエラーをシミュレートするため、Prismaのupdateメソッドがエラーをスローするようにする
    mockPrisma.request.update.mockRejectedValue(
      new Error("Database connection error")
    );

    const response = await request(app)
      .put(`/request/denial/${applicationId}`)
      .send({ adminId })
      .expect(500);

    const errorResponse = response.body;

    expect(errorResponse).toHaveProperty("error");
    expect(errorResponse.error).toBe("Database connection error");
  });
});

//エンジニアが提出申請を受け取るとき
describe("GET /receive/accept", () => {
  const userId = 1;
  it("accept", async () => {
    // モックのデータを設定する
    const mockApplications = [
      {
        applicationId: 1,
        userId: 1,
        engineerComment: "開発経験を追加しました",
        status: 3,
        adminComment: "",
        adminId: 1,
        createdAt: "2023-07-06T06:25:36.628Z",
        resultedAt: "2023-07-06T06:25:36.628Z",
      },
      {
        applicationId: 1,
        userId: 2,
        engineerComment: "開発経験を追加しました",
        status: 3,
        adminComment: "",
        adminId: 1,
        createdAt: "2023-07-06T06:25:36.628Z",
        resultedAt: "2023-07-06T06:25:36.628Z",
      },
      {
        applicationId: 2,
        userId: 1,
        engineerComment: "よろしくお願いします",
        status: 2,
        adminComment: "アーキテクチャ図の追加をお願いします",
        adminId: 1,
        createdAt: "2023-07-07T06:25:36.628Z",
        resultedAt: "2023-07-07T07:25:36.628Z",
      },
      {
        applicationId: 3,
        userId: 1,
        engineerComment: "アーキテクチャ図修正しました。確認お願いします。",
        status: 1,
        adminComment: "",
        adminId: 1,
        createdAt: "2023-07-07T08:25:36.628Z",
        resultedAt: "2023-07-07T08:25:36.628Z",
      },
    ];

    // PrismaのfindManyメソッドをモック化して、モックのデータを返すようにする
    mockPrisma.request.findMany.mockImplementation(() => {
      //Promise.resolve()はモック化されたPrismaのfindManyメソッドが返す値を表している
      return Promise.resolve(
        mockApplications.filter(
          (application) =>
            (application.status === 2 || application.status === 3) &&
            application.userId === userId
        )
      );
    });

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app)
      .get(`/request/receive/${userId}`)
      .expect(200);
    const getRequest = response.body;
    //statusが2or3及びuserIdがモックのqueryのuserIdと同じもののみ取得
    expect(response.body).toEqual(
      expect.objectContaining([
        {
          applicationId: 1,
          userId: 1,
          engineerComment: "開発経験を追加しました",
          status: 3,
          adminComment: "",
          adminId: 1,
          createdAt: "2023-07-06T06:25:36.628Z",
          resultedAt: "2023-07-06T06:25:36.628Z",
        },
        {
          applicationId: 2,
          userId: 1,
          engineerComment: "よろしくお願いします",
          status: 2,
          adminComment: "アーキテクチャ図の追加をお願いします",
          adminId: 1,
          createdAt: "2023-07-07T06:25:36.628Z",
          resultedAt: "2023-07-07T07:25:36.628Z",
        },
      ])
    );
  });

  it("requested applications", async () => {
    // PrismaのfindManyメソッドをモック化して、空の配列を返すようにする
    mockPrisma.request.findMany.mockResolvedValue([]);

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app)
      .get(`/request/receive/${userId}`)
      .expect(200);

    // レスポンスのデータを検証する
    expect(response.body).toEqual(null);
  });

  it("should return an error if there is a server error", async () => {
    // PrismaのfindManyメソッドをモック化して、エラーをスローするようにする
    mockPrisma.request.findMany.mockRejectedValue(
      new Error("Database connection error")
    );

    // リクエストを実行してレスポンスを受け取る
    const response = await request(app)
      .get(`/request/receive/${userId}`)
      .expect(500);

    // レスポンスのエラーメッセージを検証する
    expect(response.body).toEqual({ error: "Database connection error" });
  });
});

const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    admin: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma, // we add an extra reference to be able to change the behavior per test
  };
});

const handler = require("../routes/auth");
app.use(express.json());
app.use("/auth", handler);

//ユーザーの新規登録のテストケース
describe("POST/user/register", () => {
  //ユーザーの新規登録が成功するテストケース
  it("should return 200 and created user", async () => {
    const mockUser1 = {
      email: "test@example.com",
      employeeNumber: "123",
      joinDate: "2023-07-01",
      userName: "John Doe",
      affiliation: "Company A",
      businessSituation: "アサイン中",
      password: "password123",
      confirmPassword: "password123",
    };
    mockPrisma.user.create.mockResolvedValue(mockUser1);
    const response = await request(app)
      .post("/auth/register")
      .send(mockUser1)
      .expect(200);
    // アサーション: 作成されたユーザーの確認
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).toHaveProperty("userName", "John Doe");
    expect(response.body).toHaveProperty("password", "password123");
  });
  //パスワードと確認用パスワードが異なり400番のエラーが発生するテストケース
  it("passwords do not match", async () => {
    const mockUser2 = {
      email: "test@example.com",
      employeeNumber: "123",
      joinDate: "2023-07-01",
      userName: "John Doe",
      affiliation: "Company A",
      businessSituation: "アサイン中",
      password: "password123",
      confirmPassword: "mismatched123",
    };
    const response = await request(app)
      .post("/auth/register")
      .send(mockUser2)
      .expect(400);

    expect(response.body).toHaveProperty(
      "error",
      "パスワードと確認用パスワードの記載が異なります"
    );
  });
  //パスワードが短すぎて400番のエラーが発生するテストケース
  it("password length is invalid", async () => {
    const mockUser3 = {
      email: "test@example.com",
      employeeNumber: "123",
      joinDate: "2023-07-01",
      userName: "John Doe",
      affiliation: "Company A",
      businessSituation: "アサイン中",
      password: "short",
      confirmPassword: "short",
    };
    const response = await request(app)
      .post("/auth/register")
      .send(mockUser3)
      .expect(400);

    expect(response.body).toHaveProperty(
      "error",
      "パスワードは8文字以上16文字以内で登録してください"
    );
  });
});

//ユーザーログインのテストケース
describe("POST /user/login", () => {
  //ログイン成功のテストケース
  it("successful login", async () => {
    const mockUser = {
      email: "test@example.com",
      password: "password123",
    };
    const mockUserInfo = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
      employeeNumber: "123",
      joinDate: "2023-07-01",
      userName: "John Doe",
      affiliation: "Company A",
      businessSituation: "アサイン中",
    };

    mockPrisma.user.findUnique.mockImplementation((query) => {
      if (query.where.email === mockUserInfo.email) {
        return mockUserInfo;
      }
      return null;
    });
    const response = await request(app)
      .post("/auth/login")
      .send(mockUser)
      .expect(200);

    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).toHaveProperty("userName", "John Doe");
    expect(response.body).not.toHaveProperty("password");
  });
  //ユーザーがいないのでログインできない場合のテストケース
  it("user does not exist", async () => {
    const mockUser = {
      email: "nonexistent@example.com",
      password: "password123",
    };
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const response = await request(app)
      .post("/auth/login")
      .send(mockUser)
      .expect(401);

    expect(response.body).toHaveProperty("error", "認証に失敗しました");
  });
  //パスワードが異なりログインできない場合のテストケース
  it("password is incorrect", async () => {
    const mockUser = {
      email: "test@example.com",
      password: "incorrectpassword",
    };
    const mockUserInfo = {
      email: "test@example.com",
      employeeNumber: "123",
      joinDate: "2023-07-01",
      userName: "John Doe",
      affiliation: "Company A",
      businessSituation: "アサイン中",
      password: "password123",
    };
    mockPrisma.user.findUnique.mockResolvedValue(mockUserInfo);
    const response = await request(app)
      .post("/auth/login")
      .send(mockUser)
      .expect(401);

    expect(response.body).toHaveProperty("error", "パスワードが異なります");
  });
});

//管理者の新規登録のテストケース
describe("POST /admin/register", () => {
  // 管理者の新規登録が成功するテストケース
  it("should return 200 and created admin", async () => {
    const mockAdmin = {
      email: "admin@example.com",
      name: "Admin",
      password: "password123",
    };
    mockPrisma.admin.create.mockResolvedValue(mockAdmin);
    const response = await request(app)
      .post("/auth/admin/register")
      .send(mockAdmin)
      .expect(200);

    expect(response.body).toHaveProperty("email", "admin@example.com");
    expect(response.body).toHaveProperty("name", "Admin");
    expect(response.body).toHaveProperty("password", "password123");
  });

  // パスワードが短すぎて400番のエラーが発生するテストケース
  it("should return 400 when password length is invalid", async () => {
    const mockAdmin = {
      email: "admin@example.com",
      name: "Admin",
      password: "short",
    };
    const response = await request(app)
      .post("/auth/admin/register")
      .send(mockAdmin)
      .expect(400);

    expect(response.body).toHaveProperty(
      "error",
      "パスワードは8文字以上16文字以内で登録してください"
    );
  });

  // パスワードが16文字以上で400番のエラーが発生するテストケース
  it("should return 400 when password length exceeds 16 characters", async () => {
    const mockAdmin = {
      email: "admin@example.com",
      name: "Admin",
      password: "verylongpassword123456789",
    };
    const response = await request(app)
      .post("/auth/admin/register")
      .send(mockAdmin)
      .expect(400);

    expect(response.body).toHaveProperty(
      "error",
      "パスワードは8文字以上16文字以内で登録してください"
    );
  });
});

//管理者ログインのテストケース
describe("POST /admin/login", () => {
  // ログイン成功のテストケース
  it("successful login", async () => {
    const mockAdmin = {
      email: "admin@example.com",
      password: "admin123",
    };
    const mockAdminInfo = {
      email: "admin@example.com",
      password: "admin123",
      name: "Admin",
      createdAt: "2023-07-01",
    };

    mockPrisma.admin.findUnique.mockImplementation((query) => {
      if (query.where.email === mockAdminInfo.email) {
        return mockAdminInfo;
      }
      return null;
    });

    const response = await request(app)
      .post("/auth/admin/login")
      .send(mockAdmin)
      .expect(200);

    expect(response.body).toHaveProperty("email", "admin@example.com");
    expect(response.body).toHaveProperty("name", "Admin");
    expect(response.body).not.toHaveProperty("password");
  });

  // 管理者が存在しない場合のテストケース
  it("admin does not exist", async () => {
    const mockAdmin = {
      email: "nonexistent@admin.com",
      password: "admin123",
    };

    mockPrisma.admin.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/admin/login")
      .send(mockAdmin)
      .expect(401);

    expect(response.body).toHaveProperty("error", "認証に失敗しました");
  });

  // パスワードが異なる場合のテストケース
  it("password is incorrect", async () => {
    const mockAdmin = {
      email: "admin@example.com",
      password: "incorrectpassword",
    };
    const mockAdminInfo = {
      email: "admin@example.com",
      password: "admin123",
      name: "Admin",
      createdAt: "2023-07-01",
    };

    mockPrisma.admin.findUnique.mockResolvedValue(mockAdminInfo);

    const response = await request(app)
      .post("/auth/admin/login")
      .send(mockAdmin)
      .expect(401);

    expect(response.body).toHaveProperty("error", "パスワードが異なります");
  });
});

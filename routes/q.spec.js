const express = require("express");
const app = express();
const request = require("supertest");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma, // we add an extra reference to be able to change the behavior per test
  };
});

const handler = require("./users");
app.use(express.json());
app.use("/users", handler);

describe("GET /user", () => {
  const { mockPrisma } = require("@prisma/client");

  it("responds with 200 status code for User 1", async () => {
    const mockUser1 = { userId: 1, name: "Alice" };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser1);

    const response = await request(app).get("/users?userId=1");
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe(1);
  });

  it("responds with 200 status code for User 2", async () => {
    const mockUser2 = { userId: 2, name: "Bob" };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser2);

    const response = await request(app).get("/users?userId=2");
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe(2);
  });
});

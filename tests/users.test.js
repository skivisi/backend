const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require('@prisma/client');


jest.mock('@prisma/client', () => {
const mockPrisma = {
user: {
findUnique: jest.fn(),
},
};
return {
PrismaClient: jest.fn(() => mockPrisma),
mockPrisma,
};
});

const handler = require("../routes/users");
app.use(express.json());
app.use("/users", handler);

describe("GET /user", () => {
it("responds with 200 status code for User 1", async () => {
const mockUser1 = { userId: 1, name: "Alice" };

mockPrisma.user.findUnique.mockImplementation((query) => {
  if (query.where.userId === mockUser1.userId) {
    return mockUser1;
  }
  return null;
});

const response = await request(app).get("/users?userId=1");
expect(response.statusCode).toBe(200);
expect(response.body.userId).toBe(1);
});

it("response.stats 400", async () => {
const mockUser2 = { userId: 2, name: "Bob" };
mockPrisma.user.findUnique.mockResolvedValue(mockUser2);

    const response = await request(app).get(`/users`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
});
});

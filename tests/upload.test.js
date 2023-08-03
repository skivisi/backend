const request = require("supertest");
const express = require("express");
const multer = require("multer");

jest.mock("multer");

const app = express();
app.use(express.json());
//multerモジュール全体をモック化
multer.mockReturnValue({
  diskStorage: jest.fn().mockReturnValue({
    _handleFile: jest.fn().mockImplementation((req, file, cb) => {
      cb(null);
    }),
    _removeFile: jest.fn().mockImplementation((req, file, cb) => {
      cb(null);
    }),
  }),
  array: jest.fn().mockImplementation(() => (req, res, next) => {
    req.files = [{
      originalname: "test-image.jpg",
    }];
    next();
  }),
});

const router = require("../routes/upload");
app.use("/", router);

//画像アップロードのAPIのテストケース
describe("POST / - Image Upload", () => {
  it("Should respond with a 200 status code and success message", async () => {
    const mockFile = {
      originalname: "test-image.jpg",
    };

    const mockReq = {
      file: mockFile,
    };

    multer.diskStorage = jest.fn(() => ({
      _handleFile: jest.fn().mockImplementation((req, file, cb) => {
        cb(null, mockReq);
      }),
      _removeFile: jest.fn().mockImplementation((req, file, cb) => {
        cb(null);
      }),
    }));

    multer.array = jest.fn(() => (req, res, next) => {
      req.files = [mockFile];
      next();
    });

    const response = await request(app)
      .post("/")
      .attach("file", Buffer.from("Hello World"), "test-image.jpg")
      .expect(200);
    expect(response.body).toBe("画像アップロードに成功しました！");
  });

  //404エラー
  it("Should respond with a 404 status code if route does not exist", async () => {
    const response = await request(app)
      .post("/non-existing-route")
      .expect(404);

      expect(response.body).toEqual({});
  });

});

const express = require("express");
const app = express();
const request = require("supertest");

const handler = require("../routes/search");
app.use(express.json());
app.use("/search", handler);

//個人名検索でユーザー検索を行う場合のテストケース（200 and 404）
describe("GET /businessSituation", () => {
  // データベースから取得したユーザーのデータ
  const databaseUser = [
    {
      userId: 4,
      email: "nakamura@gmail.com",
      employeeNumber: 9988,
      joinDate: "2022年7月",
      userName: "中村",
      affiliation: "FR",
      businessSituation: "待機中",
      createdAt: "2023-05-23T06:32:03.988Z",
      updatedAt: "2023-05-23T06:32:03.988Z",
    }
  ];

  const databaseUsers = [
    {
      userId: 3,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    },
    {
      userId: 6,
      email: "kennsuke@gmail.com",
      employeeNumber: 2255,
      joinDate: "2021年7月",
      userName: "本田健介",
      affiliation: "QA",
      businessSituation: "アサイン中",
      createdAt: "2023-06-16T01:56:58.486Z",
      updatedAt: "2023-06-16T01:56:58.486Z",
    }
  ];
  const oneUsers = [
    {
      userId: 6,
      email: "kennsuke@gmail.com",
      employeeNumber: 2255,
      joinDate: "2021年7月",
      userName: "本田健介",
      affiliation: "QA",
      businessSituation: "アサイン中",
      createdAt: "2023-06-16T01:56:58.486Z",
      updatedAt: "2023-06-16T01:56:58.486Z",
    }
  ];

  //userName"中村"で検索
  it("returns filtered users(中村)", async () => {
    const response = await request(app)
      .get("/search/users")
      .query({ userName: "中村" })
      .expect(200);
    expect(response.body).toEqual(databaseUser);
  });
  //userName"本田"で検索
  it("returns filtered users（本田、本田健介）", async () => {
    const response = await request(app)
      .get("/search/users")
      .query({ userName: "本田" })
      .expect(200);
    expect(response.body).toEqual(databaseUsers);
  });
  //userName"本田健介"で検索
  it("returns filtered users（本田健介）", async () => {
    const response = await request(app)
      .get("/search/users")
      .query({ userName: "本田健介" })
      .expect(200);
    expect(response.body).toEqual(oneUsers);
  });
  //userName"橘"(データベースにない名前)で検索([]がresponse.bodyで返される)
  it("no user return", async () => {
    const response = await request(app)
      .get("/search/users")
      .query({ userName: "橘" })
      .expect(200);
    expect(response.body).toEqual([]);
  });
  //URLを間違えている場合(404エラー)
  it("return 404", async () => {
    const response = await request(app)
      .get("/search/")
      .query({ userName: "本田健介" })
      .expect(404);
  });
});




//検索絞り込みでユーザーが見つかるテストケース(200)
describe("GET /businessSituation", () => {
  // データベースから取得したユーザーのデータ
  const databaseUser = [
    {
      userId: 3,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    }
  ];

  const databaseUsers = [
    {
      userId: 3,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    },
    {
      userId: 4,
      email: "nakamura@gmail.com",
      employeeNumber: 9988,
      joinDate: "2022年7月",
      userName: "中村",
      affiliation: "FR",
      businessSituation: "待機中",
      createdAt: "2023-05-23T06:32:03.988Z",
      updatedAt: "2023-05-23T06:32:03.988Z",
    }
  ];

  //所属、業務形態、スキル要約で検索
  it("returns filtered users based on affiliation and businessSituation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL", businessSituation: "待機中",skillSummary:"React,Vue.js,AWS" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUser);
  });
//所属、業務形態で検索
  it("returns filtered users based on affiliation and businessSituation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL", businessSituation: "待機中" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUser);
  });
  //所属、スキル要約で検索
  it("returns filtered users based on affiliation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL", skillSummary:"React,Vue.js,AWS" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUser);
  });
  //業務形態、スキル要約で検索
  it("returns filtered users based on businessSituation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ businessSituation: "待機中",skillSummary:"React,Vue.js,AWS" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUsers);
  });
//所属で検索
  it("returns filtered users based on affiliation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUser);
  });
//業務形態で検索
  it("returns filtered users based on businessSituation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({businessSituation: "待機中" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUsers);
  });
//スキル要約で検索
  it("returns filtered users based on skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ skillSummary:"React,Vue.js,AWS" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual(databaseUsers);
  });
});



//検索絞り込みでユーザーが見つからない場合のテストケース(200)
describe("GET /businessSituation", () => {
  //所属、業務形態、スキル要約で検索
  it("returns not users affiliation and businessSituation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL", businessSituation: "待機中",skillSummary:"jQuery" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
//所属、業務形態で検索
  it("returns filtered users based on affiliation and businessSituation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "CL", businessSituation: "アサイン中" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
  //所属、スキル要約で検索
  it("returns filtered users based on affiliation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "FR", skillSummary:"jQuery" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
  //業務形態、スキル要約で検索
  it("returns filtered users based on businessSituation and skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ businessSituation: "アサイン中",skillSummary:"jQuery" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
//所属で検索
  it("returns filtered users based on affiliation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ affiliation: "PHP" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
//業務形態で検索
  it("returns filtered users based on businessSituation", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({businessSituation: "アサイン中" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
//スキル要約で検索
  it("returns filtered users based on skillSummary", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/search/integration")
      .query({ skillSummary:"jQuery" })
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual([]);
  });
});



//検索絞り込みでURLが異なっていた場合(404)
describe("GET /businessSituation", () => {
  // データベースから取得したユーザーのデータ
  const databaseUser = [
    {
      userId: 3,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    }
  ];

  const databaseUsers = [
    {
      userId: 3,
      email: "honda@gmail.com",
      employeeNumber: 5577,
      joinDate: "2022年7月",
      userName: "本田",
      affiliation: "CL",
      businessSituation: "待機中",
      createdAt: "2023-05-22T01:33:55.690Z",
      updatedAt: "2023-05-22T01:33:55.690Z",
    },
    {
      userId: 4,
      email: "nakamura@gmail.com",
      employeeNumber: 9988,
      joinDate: "2022年7月",
      userName: "中村",
      affiliation: "FR",
      businessSituation: "待機中",
      createdAt: "2023-05-23T06:32:03.988Z",
      updatedAt: "2023-05-23T06:32:03.988Z",
    }
  ];

  //所属、業務形態、スキル要約で検索
  it("return 404", async () => {
    // API のリクエストを送信
    const response = await request(app)
      .get("/integration")
      .query({ affiliation: "CL", businessSituation: "待機中",skillSummary:"React,Vue.js,AWS" })
      .expect(404);
  });
});

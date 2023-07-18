const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    spec: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    portfolio: {
      createMany: jest.fn(),
    },
    skillSummary: {
      createMany: jest.fn(),
    },
    sellingPoint: {
      createMany: jest.fn(),
    },
    qualification: {
      createMany: jest.fn(),
    },
    previousWork: {
      createMany: jest.fn(),
    },
    developmentExperience: {
      createMany: jest.fn(),
    },
    autoCalibration: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma,
  };
});

const handler = require("../routes/spec");
app.use(express.json());
app.use("/spec", handler);

//specテーブルへのPOSTするAPIのテストコード
describe("POST /spec/post/:userId", () => {
  it("should create a new spec and update existing specs' searchs to false", async () => {
    const userId = 1;
    const requestBody = {
      github: "github.com/sinnji",
      offHours: "webを支える技術",
    };

    const existingSpecs = [
      {
        specId: 2,
        userId: 1,
        github: "github.com/HONDA",
        offHours: "リーダブルコード",
        searchs: true,
        createdAt: "2023-06-19T01:18:20.759Z",
      },
      {
        specId: 3,
        userId: 1,
        github: "github.com/nakamura",
        offHours: "リーダブルコード",
        searchs: true,
        createdAt: "2023-06-19T02:05:02.932Z",
      },
    ];

    const Specs = [
      {
        specId: 2,
        userId: 1,
        github: "github.com/HONDA",
        offHours: "リーダブルコード",
        searchs: false,
        createdAt: "2023-06-19T01:18:20.759Z",
      },
      {
        specId: 3,
        userId: 1,
        github: "github.com/nakamura",
        offHours: "リーダブルコード",
        searchs: false,
        createdAt: "2023-06-19T02:05:02.932Z",
      },
    ];

    const postMockUser = {
      specId: 4,
      userId: 1,
      github: requestBody.github,
      offHours: requestBody.offHours,
      searchs: true,
    };

    mockPrisma.spec.findMany.mockResolvedValue(existingSpecs);
    mockPrisma.spec.updateMany.mockResolvedValue(Specs);
    mockPrisma.spec.create.mockResolvedValue(postMockUser);

    const response = await request(app)
      .post(`/spec/post/${userId}`)
      .send(requestBody)
      .expect(200);
    expect(response.body).toEqual(postMockUser);

    expect(mockPrisma.spec.findMany).toHaveBeenCalledWith({
      where: { userId: userId },
    });
    expect(mockPrisma.spec.updateMany).toHaveBeenCalledWith({
      where: {
        specId: { in: existingSpecs.map((spec) => spec.specId) },
      },
      data: { searchs: false },
    });
    expect(mockPrisma.spec.create).toHaveBeenCalledWith({
      data: {
        userId: userId,
        github: requestBody.github,
        offHours: requestBody.offHours,
        createdAt: expect.any(Date),
      },
    });
    // ユーザーが存在しない場合 (404 Not Found)
    const responseNotFound = await request(app)
      .post(`/post/${userId}`)
      .send(requestBody)
      .expect(404);
  });
  it("500 status code", async () => {
    const userId = 1;
    const requestBody = {
      github: "github.com/sinnji",
      offHours: "webを支える技術",
    };
    // Prisma クライアントの createMany メソッドのモック実装（エラーを返す）
    mockPrisma.spec.create.mockRejectedValue(
      new Error("Internal Server Error")
    );
    // API のリクエストを送信
    const response = await request(app)
      .post(`/spec/post/${userId}`)
      .send(requestBody)
      .expect(500);
    expect(response.body).toEqual({
      error: "Internal Server Error",
    });
  });
});

//userが作成した最新のspecId及びspecIdに紐付いたportfolio、skillSummary、sellingPoint、qualification、previousWork、developmentExperienceのテーブルの情報を取得するAPIのテストコード
describe("GET /spec/get/:userId", () => {
  it("should retrieve the latest spec and related tables", async () => {
    const userId = 1;

    const specId = 4;
    const portfolios = [
      {
        portfolioId: 7,
        specId: 2,
        heading: "Web Development Projects",
        url: "https://portfolio.example.com",
      },
      {
        portfolioId: 8,
        specId: 2,
        heading: "Graphic Design Portfolio",
        url: "https://portfolio.example.com",
      },
    ];
    const skillSummaries = [
      {
        skillSummaryId: 7,
        specId: 2,
        environment: ["Mac OS", "CentOS", "Windows", "sugoiyatsu"],
        programmingLanguage: ["TypeScript", "JavaScript", "python"],
        framework: ["Vue.js", "Flask"],
        library: ["React"],
        cloud: ["AWS"],
        tool: ["vscode"],
        developmentDomain: ["設計", "実装"],
      },
    ];
    const sellingPoints = [
      {
        sellingPointId: 7,
        specId: 2,
        title: "可読性の高いコーディングの心掛け",
        content:
          "リーダブルコードなどを参考にし、わかりにくい変数名やメソッド名をつけない、インテンドをしっかりとつける、ネストを深くしない、不要なコードをコメントアウトで取っておかないなど基本の徹底を行い、レビューアーがレビューしやすい可読性の高いコーディングを意識しています。",
      },
      {
        sellingPointId: 8,
        specId: 2,
        title: "課題解決の為の質問",
        content:
          "Googleの人工知能開発チームの「15分ルール」を参考にし、最初の15分は自分自身で解決を試みる、15分後も解決していなかったら必ず有識者に確認します。\nまた、業務の目的を合わせ手戻りを防ぐために質問だけではなく、日々の会話ベースでの確認なども意識しています。\n質問は結論と自身の考えを明確に伝え、読み手にわかりやすく時間の取らせない工夫をおこなっています。",
      },
    ];
    const qualifications = [
      {
        qualificationId: 7,
        specId: 2,
        credential: "AWSスペシャリスト",
        acquisitionDate: "2022年10月",
      },
      {
        qualificationId: 8,
        specId: 2,
        credential: "HTML5",
        acquisitionDate: "2023年4月",
      },
    ];
    const previousWorks = [
      {
        previousWorkId: 7,
        specId: 2,
        industry: "公務員",
        occupation: "市役所職員",
        JobDuties: "会計事務をしていました。",
      },
      {
        previousWorkId: 8,
        specId: 2,
        industry: "IT業界",
        occupation: "メーケティング",
        JobDuties: "SEO対策、SNSマーケティングを担当していました。",
      },
    ];
    const developmentExperiences = [
      {
        developmentExperienceId: 5,
        specId: 2,
        startYear: 2023,
        startDate: 4,
        duration: "3週間",
        assignedTask: "実装",
        teamSize: "3人",
        totalProjectHeadcount: "10人",
        projectName: "パワプロ",
        jobDuties:
          "MERN(MongoDB、Express.js、React、Node.js)を用いたSNSサイトのフルスタック開発",
        img: "project_b.jpg",
        environments: ["Mac OS", "CentOS"],
        programmingLanguages: ["TypeScript"],
        frameworks: ["Vue.js"],
        tools: ["vscode"],
      },
      {
        developmentExperienceId: 6,
        specId: 2,
        startYear: 2023,
        startDate: 5,
        duration: "3週間",
        assignedTask: "設計・実装",
        teamSize: "5人",
        totalProjectHeadcount: "12人",
        projectName: "skivisi",
        jobDuties: "ECサイトのリプレイス",
        img: "project_c.jpg",
        environments: ["Windows"],
        programmingLanguages: ["python"],
        frameworks: ["Flask"],
        tools: ["vscode", "postman"],
      },
    ];

    const mockSpec = {
      specId,
      userId,
      portfolios,
      skillSummaries,
      sellingPoints,
      qualifications,
      previousWorks,
      developmentExperiences,
    };

    mockPrisma.spec.findFirst.mockResolvedValue(mockSpec);

    const response = await request(app).get(`/spec/get/${userId}`).expect(200);

    expect(response.body).toEqual(mockSpec);

    expect(mockPrisma.spec.findFirst).toHaveBeenCalledWith({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        specId: true,
        portfolios: true,
        skillSummaries: true,
        sellingPoints: true,
        qualifications: true,
        previousWorks: true,
        developmentExperiences: true,
      },
    });
  });

  it("should return 404 if spec is not found", async () => {
    const userId = 1;

    mockPrisma.spec.findFirst.mockResolvedValue(null);

    const response = await request(app).get(`/spec/get/${userId}`).expect(404);

    expect(response.body).toEqual({ error: "Spec not found" });

    expect(mockPrisma.spec.findFirst).toHaveBeenCalledWith({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        specId: true,
        portfolios: true,
        skillSummaries: true,
        sellingPoints: true,
        qualifications: true,
        previousWorks: true,
        developmentExperiences: true,
      },
    });
  });

  it("should return 500 status code in case of error", async () => {
    const userId = 1;

    mockPrisma.spec.findFirst.mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app).get(`/spec/get/${userId}`).expect(500);

    expect(response.body).toEqual({ error: "Internal Server Error" });

    expect(mockPrisma.spec.findFirst).toHaveBeenCalledWith({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        specId: true,
        portfolios: true,
        skillSummaries: true,
        sellingPoints: true,
        qualifications: true,
        previousWorks: true,
        developmentExperiences: true,
      },
    });
  });
});

//portfolio,skillSummary,sellingPoint,qualification,previousWork,developmentExperienceのテーブルに情報をPOSTするAPIのテスト
describe("POST /spec/postData/:specId", () => {
  it("should create data in portfolio, skillSummary, sellingPoint, qualification, previousWork, and developmentExperience tables", async () => {
    const specId = 4;

    const portfolios = [
      {
        heading: "Web Development Projects",
        url: "https://portfolio.example.com",
      },
      {
        heading: "Graphic Design Portfolio",
        url: "https://portfolio.example.com",
      },
    ];
    const skillSummaries = [
      {
        environment: ["Mac OS", "CentOS", "Windows", "sugoiyatsu"],
        programmingLanguage: ["TypeScript", "JavaScript", "python"],
        framework: ["Vue.js", "Flask"],
        library: ["React"],
        cloud: ["AWS"],
        tool: ["vscode"],
        developmentDomain: ["設計", "実装"],
      },
    ];
    const sellingPoints = [
      {
        title: "可読性の高いコーディングの心掛け",
        content:
          "リーダブルコードなどを参考にし、わかりにくい変数名やメソッド名をつけない、インテンドをしっかりとつける、ネストを深くしない、不要なコードをコメントアウトで取っておかないなど基本の徹底を行い、レビューアーがレビューしやすい可読性の高いコーディングを意識しています。",
      },
      {
        title: "課題解決の為の質問",
        content:
          "Googleの人工知能開発チームの「15分ルール」を参考にし、最初の15分は自分自身で解決を試みる、15分後も解決していなかったら必ず有識者に確認します。\nまた、業務の目的を合わせ手戻りを防ぐために質問だけではなく、日々の会話ベースでの確認なども意識しています。\n質問は結論と自身の考えを明確に伝え、読み手にわかりやすく時間の取らせない工夫をおこなっています。",
      },
    ];
    const qualifications = [
      {
        credential: "AWSスペシャリスト",
        acquisitionDate: "2022年10月",
      },
      {
        credential: "HTML5",
        acquisitionDate: "2023年4月",
      },
    ];
    const previousWorks = [
      {
        industry: "公務員",
        occupation: "市役所職員",
        JobDuties: "会計事務をしていました。",
      },
      {
        industry: "IT業界",
        occupation: "メーケティング",
        JobDuties: "SEO対策、SNSマーケティングを担当していました。",
      },
    ];
    const developmentExperiences = [
      {
        startYear: 2023,
        startDate: 4,
        duration: "3週間",
        assignedTask: "実装",
        teamSize: "3人",
        totalProjectHeadcount: "10人",
        projectName: "パワプロ",
        jobDuties:
          "MERN(MongoDB、Express.js、React、Node.js)を用いたSNSサイトのフルスタック開発",
        img: "project_b.jpg",
        environments: ["Mac OS", "CentOS"],
        programmingLanguages: ["TypeScript"],
        frameworks: ["Vue.js"],
        tools: ["vscode"],
      },
      {
        startYear: 2023,
        startDate: 5,
        duration: "3週間",
        assignedTask: "設計・実装",
        teamSize: "5人",
        totalProjectHeadcount: "12人",
        projectName: "skivisi",
        jobDuties: "ECサイトのリプレイス",
        img: "project_c.jpg",
        environments: ["Windows"],
        programmingLanguages: ["python"],
        frameworks: ["Flask"],
        tools: ["vscode", "postman"],
      },
    ];

    const mockData = {
      portfolios: portfolios,
      skillSummaries: skillSummaries,
      sellingPoints: sellingPoints,
      qualifications: qualifications,
      previousWorks: previousWorks,
      developmentExperiences: developmentExperiences,
    };

    const mockResponse = {
      portfolio: { count: portfolios.length },
      skillSummary: { count: skillSummaries.length },
      sellingPoint: { count: sellingPoints.length },
      qualification: { count: qualifications.length },
      previousWork: { count: previousWorks.length },
      developmentExperience: { count: developmentExperiences.length },
    };
    const mockPortfolio = {
      count: portfolios.length,
    };
    const mockSkillSummary = {
      count: skillSummaries.length,
    };
    const mockSkillPoints = {
      count: sellingPoints.length,
    };
    const mockQualification = {
      count: qualifications.length,
    };
    const mockPreviousWork = {
      count: previousWorks.length,
    };
    const mockDevelopmentExperience = {
      count: developmentExperiences.length,
    };

    mockPrisma.portfolio.createMany.mockResolvedValue(mockPortfolio);
    mockPrisma.skillSummary.createMany.mockResolvedValue(mockSkillSummary);
    mockPrisma.sellingPoint.createMany.mockResolvedValue(mockSkillPoints);
    mockPrisma.qualification.createMany.mockResolvedValue(mockQualification);
    mockPrisma.previousWork.createMany.mockResolvedValue(mockPreviousWork);
    mockPrisma.developmentExperience.createMany.mockResolvedValue(
      mockDevelopmentExperience
    );

    const response = await request(app)
      .post(`/spec/postData/${specId}`)
      .send(mockData)
      .expect(200);
    expect(response.body).toEqual(mockResponse);

    expect(mockPrisma.portfolio.createMany).toHaveBeenCalledWith({
      data: portfolios.map((item) => ({
        specId: specId,
        heading: item.heading,
        url: item.url,
      })),
    });
    expect(mockPrisma.skillSummary.createMany).toHaveBeenCalledWith({
      data: skillSummaries.map((item) => ({
        specId: specId,
        environment: item.environment,
        programmingLanguage: item.programmingLanguage,
        framework: item.framework,
        library: item.library,
        cloud: item.cloud,
        tool: item.tool,
        developmentDomain: item.developmentDomain,
      })),
    });
    expect(mockPrisma.sellingPoint.createMany).toHaveBeenCalledWith({
      data: sellingPoints.map((item) => ({
        specId: specId,
        title: item.title,
        content: item.content,
      })),
    });
    expect(mockPrisma.qualification.createMany).toHaveBeenCalledWith({
      data: qualifications.map((item) => ({
        specId: specId,
        credential: item.credential,
        acquisitionDate: item.acquisitionDate,
      })),
    });
    expect(mockPrisma.previousWork.createMany).toHaveBeenCalledWith({
      data: previousWorks.map((item) => ({
        specId: specId,
        industry: item.industry,
        occupation: item.occupation,
        JobDuties: item.JobDuties,
      })),
    });
    expect(mockPrisma.developmentExperience.createMany).toHaveBeenCalledWith({
      data: developmentExperiences.map((item) => ({
        specId: specId,
        startYear: item.startYear,
        startDate: item.startDate,
        duration: item.duration,
        assignedTask: item.assignedTask,
        teamSize: item.teamSize,
        totalProjectHeadcount: item.totalProjectHeadcount,
        projectName: item.projectName,
        jobDuties: item.jobDuties,
        img: item.img,
        environments: item.environments,
        programmingLanguages: item.programmingLanguages,
        frameworks: item.frameworks,
        tools: item.tools,
      })),
    });
  });

  it("should return 404 status code if data is not found", async () => {
    const specId = 4;

    const portfolios = [
      {
        heading: "Web Development Projects",
        url: "https://portfolio.example.com",
      },
      {
        heading: "Graphic Design Portfolio",
        url: "https://portfolio.example.com",
      },
    ];
    const skillSummaries = [
      {
        environment: ["Mac OS", "CentOS", "Windows", "sugoiyatsu"],
        programmingLanguage: ["TypeScript", "JavaScript", "python"],
        framework: ["Vue.js", "Flask"],
        library: ["React"],
        cloud: ["AWS"],
        tool: ["vscode"],
        developmentDomain: ["設計", "実装"],
      },
    ];
    const sellingPoints = [
      {
        title: "可読性の高いコーディングの心掛け",
        content:
          "リーダブルコードなどを参考にし、わかりにくい変数名やメソッド名をつけない、インテンドをしっかりとつける、ネストを深くしない、不要なコードをコメントアウトで取っておかないなど基本の徹底を行い、レビューアーがレビューしやすい可読性の高いコーディングを意識しています。",
      },
      {
        title: "課題解決の為の質問",
        content:
          "Googleの人工知能開発チームの「15分ルール」を参考にし、最初の15分は自分自身で解決を試みる、15分後も解決していなかったら必ず有識者に確認します。\nまた、業務の目的を合わせ手戻りを防ぐために質問だけではなく、日々の会話ベースでの確認なども意識しています。\n質問は結論と自身の考えを明確に伝え、読み手にわかりやすく時間の取らせない工夫をおこなっています。",
      },
    ];
    const qualifications = [
      {
        credential: "AWSスペシャリスト",
        acquisitionDate: "2022年10月",
      },
      {
        credential: "HTML5",
        acquisitionDate: "2023年4月",
      },
    ];
    const previousWorks = [
      {
        industry: "公務員",
        occupation: "市役所職員",
        JobDuties: "会計事務をしていました。",
      },
      {
        industry: "IT業界",
        occupation: "メーケティング",
        JobDuties: "SEO対策、SNSマーケティングを担当していました。",
      },
    ];
    const developmentExperiences = [
      {
        startYear: 2023,
        startDate: 4,
        duration: "3週間",
        assignedTask: "実装",
        teamSize: "3人",
        totalProjectHeadcount: "10人",
        projectName: "パワプロ",
        jobDuties:
          "MERN(MongoDB、Express.js、React、Node.js)を用いたSNSサイトのフルスタック開発",
        img: "project_b.jpg",
        environments: ["Mac OS", "CentOS"],
        programmingLanguages: ["TypeScript"],
        frameworks: ["Vue.js"],
        tools: ["vscode"],
      },
      {
        startYear: 2023,
        startDate: 5,
        duration: "3週間",
        assignedTask: "設計・実装",
        teamSize: "5人",
        totalProjectHeadcount: "12人",
        projectName: "skivisi",
        jobDuties: "ECサイトのリプレイス",
        img: "project_c.jpg",
        environments: ["Windows"],
        programmingLanguages: ["python"],
        frameworks: ["Flask"],
        tools: ["vscode", "postman"],
      },
    ];

    const mockData = {
      portfolios: portfolios,
      skillSummaries: skillSummaries,
      sellingPoints: sellingPoints,
      qualifications: qualifications,
      previousWorks: previousWorks,
      developmentExperiences: developmentExperiences,
    };

    const mockPortfolio = {
      count: portfolios.length,
    };
    const mockSkillSummary = {
      count: skillSummaries.length,
    };
    const mockSkillPoints = {
      count: sellingPoints.length,
    };
    const mockQualification = {
      count: qualifications.length,
    };
    const mockPreviousWork = {
      count: previousWorks.length,
    };
    const mockDevelopmentExperience = {
      count: developmentExperiences.length,
    };

    mockPrisma.portfolio.createMany.mockResolvedValue(mockPortfolio);
    mockPrisma.skillSummary.createMany.mockResolvedValue(mockSkillSummary);
    mockPrisma.sellingPoint.createMany.mockResolvedValue(mockSkillPoints);
    mockPrisma.qualification.createMany.mockResolvedValue(mockQualification);
    mockPrisma.previousWork.createMany.mockResolvedValue(mockPreviousWork);
    mockPrisma.developmentExperience.createMany.mockResolvedValue(
      mockDevelopmentExperience
    );

    const response = await request(app)
      .post(`/postData/${specId}`)
      .send(mockData)
      .expect(404);
  });

  it("should return 500 status code in case of error", async () => {
    const specId = 4;

    const portfolios = [
      {
        heading: "Web Development Projects",
        url: "https://portfolio.example.com",
      },
      {
        heading: "Graphic Design Portfolio",
        url: "https://portfolio.example.com",
      },
    ];

    const mockData = {
      portfolios: portfolios,
      skillSummaries: [],
      sellingPoints: [],
      qualifications: [],
      previousWorks: [],
      developmentExperiences: [],
    };

    mockPrisma.portfolio.createMany.mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post(`/spec/postData/${specId}`)
      .send(mockData)
      .expect(500);

    expect(response.body).toEqual({ error: "Internal Server Error" });

    expect(mockPrisma.portfolio.createMany).toHaveBeenCalledWith({
      data: portfolios.map((item) => ({
        specId: specId,
        heading: item.heading,
        url: item.url,
      })),
    });
  });
});

//自動補完テーブルに存在しないスキル要約のスキルを自動補完テーブルにPOSTするAPIのテストケース
describe("POST /autoCalibration", () => {
  it("should add new skills to the autoCalibration table", async () => {
    const requestBody = {
      skillSummaries: [
        {
          environment: ["Docker"],
          programmingLanguage: ["Python"],
          framework: ["Flask"],
          library: ["NumPy"],
          cloud: ["AWS"],
          tool: ["Git"],
          developmentDomain: ["Web"],
        },
      ],
    };

    const skills = [
      "Docker",
      "Python",
      "Flask",
      "NumPy",
      "AWS",
      "Git",
      "Web",
    ];

    const existingSkills = [
      {
        skill: "Python",
      },
    ];

    const expectedSkillsToAdd = [
      "Docker",
      "Flask",
      "NumPy",
      "AWS",
      "Git",
      "Web",
    ];

    mockPrisma.autoCalibration.findMany.mockResolvedValue(existingSkills);
    mockPrisma.autoCalibration.createMany.mockResolvedValue({
      count: expectedSkillsToAdd.length,
    });

    const response = await request(app)
      .post("/spec/autoCalibration")
      .send(requestBody)
      .expect(200);

    expect(mockPrisma.autoCalibration.findMany).toHaveBeenCalledWith({
      where: {
        skill: { in: expect.arrayContaining(skills) },
      },
      select: {
        skill: true,
      },
    });

    expect(mockPrisma.autoCalibration.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining(
        expectedSkillsToAdd.map((skill) => ({
          skill,
          category: 0,
          FR: 0,
          CL: 0,
          ML: 0,
          QA: 0,
          JAVA: 0,
          PHP: 0,
        }))
      ),
    });

    expect(response.body.message).toEqual(
      "Skills added to autoCalibration table."
    );
  });

//404エラー
  it("404 status code for non-existent route", async () => {
    const requestBody = {
      skillSummaries: [
        {
          environment: ["Docker"],
          programmingLanguage: ["Python"],
          framework: ["Flask"],
          library: ["NumPy"],
          cloud: ["AWS"],
          tool: ["Git"],
          developmentDomain: ["Web"],
        },
      ],
    };

    const response = await request(app)
      .post("/autoCalibration")
      .send(requestBody)
      .expect(404);
    expect(response.body).toEqual({});
  });

//500エラー
  it("500 status code", async () => {
    const requestBody = {
      skillSummaries: [
        {
          environment: ["Docker"],
          programmingLanguage: ["Python"],
          framework: ["Flask"],
          library: ["NumPy"],
          cloud: ["AWS"],
          tool: ["Git"],
          developmentDomain: ["Web"],
        },
      ],
    };

    mockPrisma.autoCalibration.findMany.mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .post("/spec/autoCalibration")
      .send(requestBody)
      .expect(500);

    expect(response.body).toEqual({
      error: "Internal Server Error",
    });
  });
});

const express = require("express");
const app = express();
const request = require("supertest");
const { mockPrisma } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    skill: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    skillPoint: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    spaecialAbility: {
      createMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma,
  };
});

const handler = require("../routes/skill");
app.use(express.json());
app.use("/skill", handler);

//skillをpostする際のAPIのテスト
describe("POST /postSkillData/:userId", () => {
  const mockUserId = 1;
  it("creates skill, skillPoints, and spaecialAbilities successfully", async () => {
    // テスト用のデータ
    const mockReqBody = {
      InherentName: "スキル",
      InherentDescription: "メンタルが強い",
      FR: 5,
      BK: 4,
      DB: 4,
      SBR: 4,
      AR: 2,
      TS: 2,
      COM: 3,
      abilities: [
        { skillList: "予知能力", skillSelection: false, tagColor: 1 },
        { skillList: "テックリード", skillSelection: false, tagColor: 2 },
        { skillList: "vim職人", skillSelection: false, tagColor: 2 },
        { skillList: "shell芸人", skillSelection: false, tagColor: 3 },
        { skillList: "超ポジティブ", skillSelection: false, tagColor: 3 },
        { skillList: "遅刻魔", skillSelection: false, tagColor: 1 },
        { skillList: "気分屋", skillSelection: false, tagColor: 1 },
        { skillList: "新人", skillSelection: false, tagColor: 2 },
        { skillList: "お喋り野郎", skillSelection: false, tagColor: 1 },
        { skillList: "ガヤ", skillSelection: false, tagColor: 3 },
      ],
    };
    // let skillIdCounter = 1; // skillIdのカウンター変数
    // let skillPointIdCounter = 1; // skillPointIdのカウンター変数
    const mockSkill = {
      InherentName: mockReqBody.InherentName,
      InherentDescription: mockReqBody.InherentDescription,
      updatedAt: "2023-07-10T12:00:00.000Z",
      userId: mockUserId,
    };

    const mockSkillPoints = {
      FR: mockReqBody.FR,
      BK: mockReqBody.BK,
      DB: mockReqBody.DB,
      SBR: mockReqBody.SBR,
      AR: mockReqBody.AR,
      TS: mockReqBody.TS,
      COM: mockReqBody.COM,
      // skillPointId: skillPointIdCounter++,
      userId: mockUserId,
    };

    const mockSpecialAbilities = mockReqBody.abilities.map(
      (ability, index) => ({
        skillList: ability.skillList,
        skillSelection: ability.skillSelection,
        tagColor: ability.tagColor,
        // spaecialAbilityId: index + 1,
        userId: mockUserId,
      })
    );

    // Prisma クライアントの create メソッドのモック実装
    mockPrisma.skill.create.mockResolvedValue(mockSkill);
    mockPrisma.skillPoint.create.mockResolvedValue(mockSkillPoints);
    mockPrisma.spaecialAbility.createMany.mockResolvedValue(
      mockSpecialAbilities
    );

    // API のリクエストを送信
    const response = await request(app)
      .post(`/skill/postSkillData/${mockUserId}`)
      .send(mockReqBody)
      .expect(200);
    // レスポンスの検証
    expect(response.body).toEqual({
      skill: mockSkill,
      skillPoints: mockSkillPoints,
      spaecialAbilities: mockSpecialAbilities,
    });

    // Prisma クライアントの createメソッド及びcreateManyメソッドが正しく呼び出されたか検証
    expect(mockPrisma.skill.create).toHaveBeenCalledWith({
      data: {
        InherentName: mockReqBody.InherentName,
        InherentDescription: mockReqBody.InherentDescription,
        updatedAt: expect.any(Date),
        userId: mockUserId,
      },
    });
    expect(mockPrisma.skillPoint.create).toHaveBeenCalledWith({
      data: {
        FR: mockReqBody.FR,
        BK: mockReqBody.BK,
        DB: mockReqBody.DB,
        SBR: mockReqBody.SBR,
        AR: mockReqBody.AR,
        TS: mockReqBody.TS,
        COM: mockReqBody.COM,
        userId: mockUserId,
      },
    });
    expect(mockPrisma.spaecialAbility.createMany).toHaveBeenCalledWith({
      data: mockReqBody.abilities.map((ability) => ({
        skillList: ability.skillList,
        skillSelection: ability.skillSelection,
        tagColor: ability.tagColor,
        userId: mockUserId,
      })),
    });
  });

  it("returns 500 status code on error", async () => {
    // Prisma クライアントの create メソッドのモック実装（エラーを返す）
    mockPrisma.skill.create.mockRejectedValue(new Error("Prisma error"));

    // API のリクエストを送信
    const response = await request(app)
      .post(`/skill/postSkillData/${mockUserId}`)
      .send({
        InherentName: "スキル",
        InherentDescription: "メンタルが強い",
        FR: 5,
        BK: 4,
        DB: 4,
        SBR: 4,
        AR: 2,
        TS: 2,
        COM: 3,
        abilities: [
          { skillList: "予知能力", skillSelection: false, tagColor: 1 },
          { skillList: "テックリード", skillSelection: false, tagColor: 2 },
          { skillList: "vim職人", skillSelection: false, tagColor: 2 },
          { skillList: "shell芸人", skillSelection: false, tagColor: 3 },
          { skillList: "超ポジティブ", skillSelection: false, tagColor: 3 },
          { skillList: "遅刻魔", skillSelection: false, tagColor: 1 },
          { skillList: "気分屋", skillSelection: false, tagColor: 1 },
          { skillList: "新人", skillSelection: false, tagColor: 2 },
          { skillList: "お喋り野郎", skillSelection: false, tagColor: 1 },
          { skillList: "ガヤ", skillSelection: false, tagColor: 3 },
        ],
      })
      .expect(500);

    // レスポンスの検証
    expect(response.body.error).toBe("Prisma error");
  });
});

//skillのupdate
describe("PUT /update/:userId", () => {
  const mockUserId = 1;

  it("updates skills, skillPoints, and spaecialAbilities successfully", async () => {
    // テスト用のデータ
    const mockReqBody = {
      InherentName: "オールマイティー",
      InherentDescription: "全てを満遍なくこなせる",
      FR: 4,
      BK: 4,
      DB: 4,
      SBR: 4,
      AR: 4,
      TS: 4,
      COM: 4,
      abilities: [
        { skillList: "予知能力", skillSelection: false, tagColor: 1 },
        { skillList: "テックリード", skillSelection: true, tagColor: 2 },
        { skillList: "vim職人", skillSelection: true, tagColor: 2 },
        { skillList: "shell芸人", skillSelection: false, tagColor: 3 },
        { skillList: "超ポジティブ", skillSelection: false, tagColor: 3 },
        { skillList: "遅刻魔", skillSelection: true, tagColor: 1 },
        { skillList: "気分屋", skillSelection: false, tagColor: 1 },
        { skillList: "新人", skillSelection: true, tagColor: 2 },
        { skillList: "お喋り野郎", skillSelection: false, tagColor: 1 },
        { skillList: "ガヤ", skillSelection: false, tagColor: 3 },
      ],
    };

    let updatedSkills = {
      skillId: 1,
      InherentName: "スキル",
      InherentDescription: "スキルが高い",
      updatedAt: "2023-07-10T12:00:00.000Z",
      userId: 1,
    };
    if (mockUserId === updatedSkills.userId) {
      updatedSkills = {
        skillId: 1,
        InherentName: mockReqBody.InherentName,
        InherentDescription: mockReqBody.InherentDescription,
        updatedAt: "2023-07-10T12:00:00.000Z",
        userId: 1,
      };
    }

    let updatedSkillPoints = {
      skillPointId: 1,
      FR: 2,
      BK: 3,
      DB: 2,
      SBR: 4,
      AR: 4,
      TS: 3,
      COM: 2,
      userId: 1,
    };
    if (mockUserId === updatedSkills.userId) {
      updatedSkillPoints = {
        skillPointId: 1,
        FR: mockReqBody.FR,
        BK: mockReqBody.BK,
        DB: mockReqBody.DB,
        SBR: mockReqBody.SBR,
        AR: mockReqBody.AR,
        TS: mockReqBody.TS,
        COM: mockReqBody.COM,
        userId: mockUserId,
      };
    }

    let updatedAbilities = [
      {
        spaecialAbilityId: 1,
        skillList: "予知能力",
        skillSelection: false,
        tagColor: 1,
        userId: 1,
      },
      {
        spaecialAbilityId: 2,
        skillList: "テックリード",
        skillSelection: false,
        tagColor: 2,
        userId: 1,
      },
      {
        spaecialAbilityId: 3,
        skillList: "vim職人",
        skillSelection: false,
        tagColor: 2,
        userId: 1,
      },
      {
        spaecialAbilityId: 4,
        skillList: "shell芸人",
        skillSelection: false,
        tagColor: 3,
        userId: 1,
      },
      {
        spaecialAbilityId: 5,
        skillList: "超ポジティブ",
        skillSelection: false,
        tagColor: 3,
        userId: 1,
      },
      {
        spaecialAbilityId: 6,
        skillList: "遅刻魔",
        skillSelection: false,
        tagColor: 1,
        userId: 1,
      },
      {
        spaecialAbilityId: 7,
        skillList: "気分屋",
        skillSelection: false,
        tagColor: 1,
        userId: 1,
      },
      {
        spaecialAbilityId: 8,
        skillList: "新人",
        skillSelection: false,
        tagColor: 2,
        userId: 1,
      },
      {
        spaecialAbilityId: 9,
        skillList: "お喋り野郎",
        skillSelection: false,
        tagColor: 1,
        userId: 1,
      },
      {
        spaecialAbilityId: 10,
        skillList: "ガヤ",
        skillSelection: false,
        tagColor: 3,
        userId: 1,
      },
    ];

    // updatedAbilitiesの各要素のskillSelectionを更新する
    updatedAbilities = updatedAbilities.map((ability) => {
      const matchingAbility = mockReqBody.abilities.find(
        (item) => item.skillList === ability.skillList
      );
      if (matchingAbility) {
        return {
          ...ability,
          skillSelection: matchingAbility.skillSelection,
        };
      }
      return ability;
    });

    // Prisma クライアントの updateMany メソッドのモック実装
    mockPrisma.skill.updateMany.mockResolvedValue(updatedSkills);
    mockPrisma.skillPoint.updateMany.mockResolvedValue(updatedSkillPoints);
    jest.spyOn(Promise, "all").mockResolvedValue(updatedAbilities);

    // API のリクエストを送信
    const response = await request(app)
      .put(`/skill/update/${mockUserId}`)
      .send(mockReqBody)
      .expect(200);

    // レスポンスの検証
    expect(response.body).toStrictEqual({
      updatedSkills: updatedSkills,
      updatedSkillPoints: updatedSkillPoints,
      updatedAbilities: updatedAbilities,
    });

    // Prisma クライアントの updateMany メソッドが正しく呼び出されたか検証
    expect(mockPrisma.skill.updateMany).toHaveBeenCalledWith({
      where: {
        userId: mockUserId,
      },
      data: {
        InherentName: mockReqBody.InherentName,
        InherentDescription: mockReqBody.InherentDescription,
        updatedAt: expect.any(Date),
      },
    });

    expect(mockPrisma.skillPoint.updateMany).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      data: {
        FR: mockReqBody.FR,
        BK: mockReqBody.BK,
        DB: mockReqBody.DB,
        SBR: mockReqBody.SBR,
        AR: mockReqBody.AR,
        TS: mockReqBody.TS,
        COM: mockReqBody.COM,
      },
    });
    // Promise.allが正しく呼び出されたか検証
    expect(Promise.all).toHaveBeenCalledWith(
      mockReqBody.abilities.map((ability) => expect.any(Promise))
    );
  });

  it("returns 500 status code on error", async () => {
    // Prisma クライアントの updateMany メソッドのモック実装（エラーを返す）
    mockPrisma.skill.updateMany.mockRejectedValue(new Error("Prisma error"));

    // API のリクエストを送信
    const response = await request(app)
      .put(`/skill/update/${mockUserId}`)
      .send({
        InherentName: "スキル",
        InherentDescription: "メンタルが強い",
        FR: 5,
        BK: 4,
        DB: 4,
        SBR: 4,
        AR: 2,
        TS: 2,
        COM: 3,
        abilities: [
          { skillList: "予知能力", skillSelection: false, tagColor: 1 },
          { skillList: "テックリード", skillSelection: false, tagColor: 2 },
          { skillList: "vim職人", skillSelection: false, tagColor: 2 },
          { skillList: "shell芸人", skillSelection: false, tagColor: 3 },
          { skillList: "超ポジティブ", skillSelection: false, tagColor: 3 },
          { skillList: "遅刻魔", skillSelection: false, tagColor: 1 },
          { skillList: "気分屋", skillSelection: false, tagColor: 1 },
          { skillList: "新人", skillSelection: false, tagColor: 2 },
          { skillList: "お喋り野郎", skillSelection: false, tagColor: 1 },
          { skillList: "ガヤ", skillSelection: false, tagColor: 3 },
        ],
      })
      .expect(500);

    // レスポンスの検証
    expect(response.body.error).toBe("Prisma error");
  });
});

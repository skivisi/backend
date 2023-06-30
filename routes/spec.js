const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//specテーブルへのPOST
router.post("/post/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { github, offHours } = req.body;

    const existingSpec = await prisma.spec.findFirst({
      where: {
        userId: parseInt(userId),
      },
    });

    if (existingSpec) {
      // 既存のレコードが存在する場合はsearchsをfalseに変更
      await prisma.spec.update({
        where: {
          specId: existingSpec.specId,
        },
        data: {
          searchs: false,
        },
      });
    }

    const specs = await prisma.spec.create({
      data: {
        userId: parseInt(userId),
        github: github,
        offHours: offHours,
        createdAt: new Date(),
      },
    });

    return res.json(specs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//userが作成した最新のspecId及びspecIdに紐付いたportfolio、skillSummary、sellingPoint、qualification、previousWork、developmentExperienceのテーブルの情報を取得するAPI
router.get("/get/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userNumber = parseInt(userId);
    // 最新のcreatedAtを持つspecを取得
    let spec = await prisma.spec.findFirst({
      where: { userId: userNumber },
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

    if (!spec) {
      return res.status(404).json({ error: "Spec not found" });
    }

    return res.json(spec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//指定されたspecIdに紐付いたportfolio、skillSummary、sellingPoint、qualification、previousWork、developmentExperienceのテーブルの情報を取得するAPI
// router.get("/getData/:specId", async (req, res) => {
//   try {
//     const { specId } = req.params;
//     const specNumber = parseInt(specId);

//     const specPortfolio = await prisma.portfolio.findMany({
//       where: {
//         specId: specNumber,
//       },
//     });

//     const specSkillSummaries = await prisma.skillSummary.findMany({
//       where: {
//         specId: specNumber,
//       },
//     });

//     const specSellingPoint = await prisma.sellingPoint.findMany({
//       where: {
//         specId: specNumber,
//       },
//     });

//     const specQualification = await prisma.qualification.findMany({
//       where: {
//         specId: specNumber,
//       },
//     });

//     const specPreviousWork = await prisma.previousWork.findMany({
//       where: {
//         specId: specNumber,
//       },
//     });

//     const specDevelopmentExperience =
//       await prisma.developmentExperience.findMany({
//         where: {
//           specId: specNumber,
//         },
//       });

//     return res.json({
//       portfolio: specPortfolio,
//       skillSummary: specSkillSummaries,
//       sellingPoint: specSellingPoint,
//       qualification: specQualification,
//       previousWork: specPreviousWork,
//       developmentExperience: specDevelopmentExperience,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

//portfolio,skillSummary,sellingPoint,qualification,previousWork,developmentExperienceのテーブルに情報をPOST
router.post("/postData/:specId", async (req, res) => {
  try {
    const { specId } = req.params;
    const specNumber = parseInt(specId);

    const {
      portfolios,
      skillSummaries,
      sellingPoints,
      qualifications,
      previousWorks,
      developmentExperiences,
    } = req.body;

    const specPortfolio = await prisma.portfolio.createMany({
      data: portfolios.map((auto) => ({
        specId: specNumber,
        heading: auto.heading,
        url: auto.url,
      })),
    });

    const specSkillSummaries = await prisma.skillSummary.createMany({
      data: skillSummaries.map((auto) => ({
        specId: specNumber,
        environment: auto.environment,
        programmingLanguage: auto.programmingLanguage,
        framework: auto.framework,
        library: auto.library,
        cloud: auto.cloud,
        tool: auto.tool,
        developmentDomain: auto.developmentDomain,
      })),
    });

    const specSellingPoint = await prisma.sellingPoint.createMany({
      data: sellingPoints.map((auto) => ({
        specId: specNumber,
        title: auto.title,
        content: auto.content,
      })),
    });

    const specQualification = await prisma.qualification.createMany({
      data: qualifications.map((auto) => ({
        specId: specNumber,
        credential: auto.credential,
        acquisitionDate: auto.acquisitionDate,
      })),
    });

    const specPreviousWork = await prisma.previousWork.createMany({
      data: previousWorks.map((auto) => ({
        specId: specNumber,
        industry: auto.industry,
        occupation: auto.occupation,
        JobDuties: auto.JobDuties,
      })),
    });

    const specDevelopmentExperience =
      await prisma.developmentExperience.createMany({
        data: developmentExperiences.map((auto) => ({
          specId: specNumber,
          startYear: auto.startYear,
          startDate: auto.startDate,
          duration: auto.duration,
          assignedTask: auto.assignedTask,
          teamSize: auto.teamSize,
          totalProjectHeadcount: auto.totalProjectHeadcount,
          projectName: auto.projectName,
          jobDuties: auto.jobDuties,
          img: auto.img,
          environments: auto.environments,
          programmingLanguages: auto.programmingLanguages,
          frameworks: auto.frameworks,
          tools: auto.tools,
        })),
      });

    return res.json({
      portfolio: specPortfolio,
      skillSummary: specSkillSummaries,
      sellingPoint: specSellingPoint,
      qualification: specQualification,
      previousWork: specPreviousWork,
      developmentExperience: specDevelopmentExperience,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/autoCalibration", async (req, res) => {
  try {
    const { skillSummaries } = req.body;

    // スキルの配列をフラット化して重複を削除
    const skills = Array.from(
      new Set(
        skillSummaries.flatMap((summary) => [
          ...summary.environment,
          ...summary.programmingLanguage,
          ...summary.framework,
          ...summary.library,
          ...summary.cloud,
          ...summary.tool,
          ...summary.developmentDomain,
        ])
      )
    );

    const existingSkills = await prisma.autoCalibration.findMany({
      where: {
        skill: { in: skills },
      },
      select: {
        skill: true,
      },
    });

    const existingSkillsSet = new Set(
      existingSkills.map((skill) => skill.skill)
    );

    const skillsToAdd = skills.filter((skill) => !existingSkillsSet.has(skill));

    const createdAutoCalibration = await prisma.autoCalibration.createMany({
      data: skillsToAdd.map((skill) => ({
        skill,
        category: 0,
        FR: 0,
        CL: 0,
        ML: 0,
        QA: 0,
        JAVA: 0,
        PHP: 0,
      })),
    });

    return res.json({
      message: "Skills added to autoCalibration table.",
      createdAutoCalibration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

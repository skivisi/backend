const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//specテーブルへのPOUT
router.post("/post/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { github, offHours } = req.body;

    const specs = await prisma.spec.create({
      data: {
        userId: parseInt(userId),
        github: github,
        offHours: offHours,
        createdAt: new Date(), // 現在の日時を設定
      },
    });
    return res.json(specs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//specIdの取得
router.get("/get/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userNumber = parseInt(userId);
    // 最新のcreatedAtを持つspecを取得
    let spec = await prisma.spec.findFirst({
      where: { userId: userNumber },
      orderBy: { createdAt: "desc" },
      select: { specId: true },
    });

    if (!spec) {
      return res.status(404).json({ error: "Spec not found" });
    }

    return res.json(spec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

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

module.exports = router;

const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//specテーブルへのPOST
router.post("/post/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { github, offHours } = req.body;

    const existingSpecs = await prisma.spec.findMany({
      where: {
        userId: parseInt(userId),
      },
    });

    if (existingSpecs.length > 0) {
      // 既存のレコードが存在する場合はsearchsをfalseに変更
      await prisma.spec.updateMany({
        where: {
          specId: {
            in: existingSpecs.map((spec) => spec.specId),
          },
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

    let {
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
      // findItems 配列の初期化
      const findItems = [];
      // skillSummaries のデータを findItems 配列に追加
    skillSummaries.forEach(item => {
      findItems.push(
        item.environment,
        item.programmingLanguage,
        item.framework,
        item.library,
        item.cloud,
        item.tool,
        item.developmentDomain
      );
    });
    // developmentExperiences のデータを findItems 配列に追加
    developmentExperiences.forEach(item => {
      findItems.push(
        item.environments,
        item.programmingLanguages,
        item.frameworks,
        item.tools
      );
    });

    // findItems の中に入れ子の配列がある場合、それを平坦化
    const tempFlattenedItems = [].concat.apply([], findItems);
    // 重複する要素を取り除くために Set オブジェクトを使用
    const uniqueSet = new Set(tempFlattenedItems);
    // Set の内容を配列に変換
    const flattenedFindItems = [...uniqueSet];

    // find テーブルにデータを挿入
    const specFind = await prisma.find.createMany({
      data: {
        specId: specNumber,
        findItems: flattenedFindItems,
      },
    });

    return res.status(200).json({
      portfolio: specPortfolio,
      skillSummary: specSkillSummaries,
      sellingPoint: specSellingPoint,
      qualification: specQualification,
      previousWork: specPreviousWork,
      developmentExperience: specDevelopmentExperience,
      find: specFind
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//自動補完テーブルに存在しないスキル要約のスキル及び開発経験のスキルを自動補完テーブルにPOST
router.post("/autoCalibration", async (req, res) => {
  try {
    const { skillSummaries,developmentExperiences } = req.body;

     // findItems 配列の初期化
     const findItems = [];
     // skillSummaries のデータを findItems 配列に追加
   skillSummaries.forEach(item => {
     findItems.push(
       item.environment,
       item.programmingLanguage,
       item.framework,
       item.library,
       item.cloud,
       item.tool,
       item.developmentDomain
     );
   });
   // developmentExperiences のデータを findItems 配列に追加
   developmentExperiences.forEach(item => {
     findItems.push(
       item.environments,
       item.programmingLanguages,
       item.frameworks,
       item.tools
     );
   });

   // findItems の中に入れ子の配列がある場合、それを平坦化
   const tempFlattenedItems = [].concat.apply([], findItems);
   // 重複する要素を取り除くために Set オブジェクトを使用
   const uniqueSet = new Set(tempFlattenedItems);
   // Set の内容を配列に変換
   const flattenedFindItems = [...uniqueSet];


    const existingSkills = await prisma.autoCalibration.findMany({
      where: {
        skill: { in: flattenedFindItems },
      },
      select: {
        skill: true,
      },
    });

    const existingSkillsSet = new Set(
      existingSkills.map((skill) => skill.skill)
    );

    const skillsToAdd = flattenedFindItems.filter((skill) => !existingSkillsSet.has(skill));
    if (skillsToAdd.length > 0) {
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
  } else {
     // skillsToAddが存在しない場合
  return res.json({
    message: "No new skills to add to autoCalibration table.",
    createdAutoCalibration: [],
  })}
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//エンジニアがスペックシートの提出申請を出したとき
router.post("/post", async (req, res) => {
  try {
    const { userId, engineerComment } = req.body;

    const requests = await prisma.request.create({
      data: {
        userId: userId,
        status: 1,
        adminComment: "", //後にupdateで修正
        engineerComment: engineerComment,
        adminId: 1, //後にupdateで修正
        createdAt: new Date(), // 現在の日時を設定
        resultedAt: new Date(), // 後にupdateで修正
      },
    });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
//管理者が提出申請を受け取るとき
router.get("/accept", async (req, res) => {
  try {
    //statusが1のものを複数受け取る
    const requestedApplications = await prisma.request.findMany({
      where: { status: 1 },
    });

    const requests =
      requestedApplications.length > 0 ? requestedApplications : null;

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//管理者による承認
router.put("/approval/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId } = req.body;
    const requestedApplications = await prisma.request.update({
      where: { applicationId: parseInt(applicationId) },
      data: { status: 3, adminId, resultedAt: new Date() },
    });

    return res.json(requestedApplications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
//否認(差し戻し)
router.put("/denial/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId, adminComment } = req.body;
    const requestedApplications = await prisma.request.update({
      where: { applicationId: parseInt(applicationId) },
      data: { status: 2, adminId, adminComment, resultedAt: new Date() },
    });

    return res.json(requestedApplications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
//エンジニアが承認、否認を受け取る
router.get("/receive", async (req, res) => {
  try {
    const { userId } = req.body;

    // statusが2または3であり、userIdにひもずく情報を取得
    const requestedApplications = await prisma.request.findMany({
      where: {
        status: {
          in: [2, 3], // statusが2または3であることを指定
        },
        userId: userId, // userIdにひもずく情報を取得
      },
    });

    const requests =
      requestedApplications.length > 0 ? requestedApplications : null;

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
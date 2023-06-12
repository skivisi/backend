const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//specテーブルへのPOUT
router.post("/post/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {github,offHours} = req.body;

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
    const userNumber = parseInt(userId)
    // 最新のcreatedAtを持つspecを取得
    let spec = await prisma.spec.findFirst({
      where: { userId: userNumber },
      orderBy: { createdAt: "desc" },
      select: { specId: true }
    });

    if (!spec) {
      return res.status(404).json({ error: "Spec not found" });
    }

    return res.json(spec);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;

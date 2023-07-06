const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//自動補完のデータを送信するAPI
router.post("/", async (req, res) => {
  try {
    const { autoCalibrations } = req.body;

    const values = await prisma.autoCalibration.createMany({
      data: autoCalibrations.map((auto) => ({
        skill: auto.skill,
        category: auto.category,
        FR: auto.FR,
        CL: auto.CL,
        ML: auto.ML,
        QA: auto.QA,
        JAVA: auto.JAVA,
        PHP: auto.PHP,
      })),
    });

    return res.json({
      autoCalibrations: values,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


router.get('/get', async (req, res) => {
  try {
    const autoCalibrations = await prisma.autoCalibration.findMany();
    res.json(autoCalibrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch autoCalibrations' });
  }
});



module.exports = router;

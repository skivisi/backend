const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//待機中とアサイン中の切り替え
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { businessSituation } = req.body;
    const users = await prisma.user.update({
      where: { userId: parseInt(userId) },
      data: { businessSituation: businessSituation, updatedAt: new Date() },
    });

    const { password, confirmPassword, ...other } = users;
    return res.json(other);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

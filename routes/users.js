const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//クエリでユーザー情報の取得
router.get("/", async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    let user;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { userId: userId },
        include: {
          skills: true,
          skillPoints: true,
          specialAbilities: true,
          specs: {
            where: { searchs: true }
          },
        },
      });
    } else {
      return res.status(400).json({ error: "userIdを指定してください" });
    }

    const { password, confirmPassword,createdAt,email,joinDate,requests,updatedAt, ...other } = user;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

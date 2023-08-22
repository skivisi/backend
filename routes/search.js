const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//個人名検索
router.get("/users", async (req, res) => {
  const userName = req.query.userName;

  try {
    const users = await prisma.user.findMany({
      where: {
        userName: {
          contains: userName,
        },
      },
    });

    const filteredUsers = users.map((user) => {
      const { password, confirmPassword, ...other } = user;
      return other;
    });

    res.json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 絞り込み検索
router.get("/integration", async (req, res) => {
  const affiliation = req.query.affiliation;
  const businessSituation = req.query.businessSituation;
  const skillSummaryValues = req.query.skillSummary
    ? req.query.skillSummary.split(",")
    : [];

  try {
    let whereCondition = {};

    if (businessSituation && affiliation) {
      whereCondition = {
        businessSituation: { contains: businessSituation },
        affiliation: { contains: affiliation },
      };
    } else if (businessSituation) {
      whereCondition = { businessSituation: { contains: businessSituation } };
    } else if (affiliation) {
      whereCondition = { affiliation: { contains: affiliation } };
    }

    const users = await prisma.user.findMany({
      where: {
        ...whereCondition,
        OR: [
          {
            specs: {
              some: {
                searchs: true,
                finds: {
                  every: {
                    AND:
                      skillSummaryValues.length > 0
                        ? skillSummaryValues.map((value) => ({
                            OR: [{ findItems: { hasEvery: value } }],
                          }))
                        : [],
                  },
                },
              },
            },
          },
          // spacsを持っていない（つまり、スペックシートの登録をしていない）userも抽出
          ...(skillSummaryValues.length === 0 ? [
          //spacsと一切関連付けられていないuserとspacsとは関連付けられているが他の条件（このクエリの場合、空の {} なので特定の条件は無い）を満たすspecsが1つもないuserを抽出
            {
              specs: {
                none: {},
              },
            }
          ] : []),
        ],
      },
      select: {
        userId: true,
        email: true,
        employeeNumber: true,
        joinDate: true,
        userName: true,
        affiliation: true,
        businessSituation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

//スキルデータを送信するAPI
router.post("/postSkillData/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { InherentName, InherentDescription, FR, BK, DB, SBR, AR, TS, COM, abilities } = req.body;

    const skill = await prisma.skill.create({
      data: {
        InherentName: InherentName,
        InherentDescription: InherentDescription,
        updatedAt: new Date(),
        userId: parseInt(userId),
      },
    });

    const skillPoints = await prisma.skillPoint.create({
      data: {
        FR: FR,
        BK: BK,
        DB: DB,
        SBR: SBR,
        AR: AR,
        TS: TS,
        COM: COM,
        userId: parseInt(userId),
      },
    });

    const spaecialAbilities = await prisma.spaecialAbility.createMany({
      data: abilities.map((ability) => ({
        skillList: ability.skillList,
        skillSelection: ability.skillSelection,
        tagColor:ability.tagColor,
        userId: parseInt(userId),
      })),
    });

    return res.json({
      skill: skill,
      skillPoints: skillPoints,
      spaecialAbilities: spaecialAbilities,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});



//スキルをupdateするAPI
router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { InherentName, InherentDescription, FR, BK, DB, SBR, AR, TS, COM, abilities } = req.body;

    const updatedSkills = await prisma.skill.updateMany({
      where: {
        userId: parseInt(userId),
      },
      data: {
        InherentName: InherentName,
        InherentDescription: InherentDescription,
        updatedAt: new Date(),
      },
    });

    const updatedSkillPoints = await prisma.skillPoint.updateMany({
      where: { userId: parseInt(userId) },
      data: {
        FR: FR,
        BK: BK,
        DB: DB,
        SBR: SBR,
        AR: AR,
        TS: TS,
        COM: COM,
      },
    });

    const updatedAbilities = await Promise.all(
      abilities.map(async (ability) => {
        const { skillList, skillSelection } = ability;
        const updatedAbility = await prisma.spaecialAbility.updateMany({
          where: {
            userId: parseInt(userId),
            skillList: skillList,
          },
          data: {
            skillSelection: skillSelection,
          },
        });
        return updatedAbility;
      })
    );

    return res.json({
      updatedSkills: updatedSkills,
      updatedSkillPoints: updatedSkillPoints,
      updatedAbilities: updatedAbilities,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;

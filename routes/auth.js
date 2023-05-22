const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();
//新規登録
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      employeeNumber,
      joinDate,
      userName,
      affiliation,
      password,
      confirmPassword,
    } = req.body;
    //バリデーション
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "パスワードと確認用パスワードの記載が異なります" });
    }

    if (password.length < 8 || password.length > 16) {
      return res
        .status(400)
        .json({ error: "パスワードは8文字以上16文字以内で登録してください" });
    }

    const users = await prisma.user.create({
      data: {
        email: email,
        employeeNumber: employeeNumber,
        joinDate: joinDate,
        userName: userName,
        affiliation: affiliation,
        password: password,
        confirmPassword: confirmPassword,
        createdAt: new Date(), // 現在の日時を設定
        updatedAt: new Date(), // 現在の日時を設定
      },
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
//ログイン
router.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // emailとpasswordを使用してユーザーを検索
    let user = await prisma.user.findUnique({ where: { email } });

    // ユーザーが存在しない場合
    if (!user) {
      return res.status(401).json({ error: "認証に失敗しました" });
    }

    // パスワードの照合
    if (user.password !== password) {
      return res.status(401).json({ error: "パスワードが異なります" });
    }

    // ユーザーの情報を返す
    //変数名passwordをuserPasswordに変更
    const { password: userPassword, confirmPassword, ...other } = user;
    return res.json(other);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

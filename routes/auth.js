const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();
const CryptoJS = require("crypto-js"); // CryptoJSライブラリを読み込む

//新規登録
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      employeeNumber,
      joinDate,
      userName,
      affiliation,
      businessSituation,
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
    // const businessSituations =
    //   businessSituation === "アサイン中" ? true : false;
    const users = await prisma.user.create({
      data: {
        email: email,
        employeeNumber: employeeNumber,
        joinDate: joinDate,
        userName: userName,
        affiliation: affiliation,
        businessSituation: businessSituation,
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
router.post("/login", async (req, res) => {
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
    // user.idを暗号化
    // const encryptedUserId = CryptoJS.AES.encrypt(
    //   user.userId.toString(),
    //   "encryptionKey"
    // ).toString();

    // Cookieをセットする
    // res.cookie("userId", encryptedUserId, { maxAge: 86400000 }); // 24時間有効なCookie

    return res.json(other);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ログアウト(Cookieを削除)するAPI
router.get("/logout", async (req, res) => {
  try {
    // Cookieの削除
    res.clearCookie("userId");

    return res.json({ message: "ログアウトしました" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


//管理者の登録
router.post("/admin/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    //バリデーション
    if (password.length < 8 || password.length > 16) {
      return res
        .status(400)
        .json({ error: "パスワードは8文字以上16文字以内で登録してください" });
    }

    const admins = await prisma.admin.create({
      data: {
        email: email,
        name: name,
        password: password,
        createdAt: new Date(), // 現在の日時を設定
      },
    });
    return res.json(admins);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//管理者のログイン
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // emailとpasswordを使用してユーザーを検索
    let user = await prisma.admin.findUnique({ where: { email } });

    // ユーザーが存在しない場合
    if (!user) {
      return res.status(401).json({ error: "このメールアドレスは登録されていません。" });
    }

    // パスワードの照合
    if (user.password !== password) {
      return res.status(401).json({ error: "パスワードが異なります" });
    }

    // ユーザーの情報を返す
    //変数名passwordをuserPasswordに変更
    const { password: userPassword, ...other } = user;
    return res.json(other);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;

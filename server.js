const { PrismaClient } = require("@prisma/client");
const express = require("express");
const path = require('path');
const app = express();
const PORT = 8000;
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], //アクセス許可するオリジン
    credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  })
);
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const requestRoute = require("./routes/request");
const skillRoute = require("./routes/skill");
const specRoute = require("./routes/spec");
const uploadRoute = require("./routes/upload");
const autoCalibrationRoute = require("./routes/autoCalibration");
const searchRoute = require("./routes/search");
const businessSituationRoute = require("./routes/businessSituation");

const prisma = new PrismaClient();
app.use(express.json());
//ミドルウェア
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/request", requestRoute);
app.use("/api/skill", skillRoute);
app.use("/api/spec", specRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/autoCalibration", autoCalibrationRoute);
app.use("/api/search", searchRoute);
app.use("/api/businessSituation", businessSituationRoute);
app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log("サーバーが起動中・・・");
});

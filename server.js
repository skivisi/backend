const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express();
const PORT = 8000;
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const requestRoute = require("./routes/request");
const skillRoute = require("./routes/skill");

const prisma = new PrismaClient();
app.use(express.json());

//ミドルウェア
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/request", requestRoute);
app.use("/api/skill", skillRoute);

app.listen(PORT, () => {
  console.log("サーバーが起動中・・・");
});

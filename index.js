const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const authRoute = require("./routes").auth; //連到routes資料夾裡面的auth屬性
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport); //取得config裡面的passport檔案，並加入passport套件
const cors = require("cors");

//連接MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("正在連接mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); //cors可以對localhost本機路徑進行http request

//有關/api/user都要連到authRoute
app.use("/api/user", authRoute);

//只有登入系統的人，才能夠去新增課程或是註冊課程
//course route應該被jwt保護
//如果request header內部沒有jwt，則request就應該被視為是unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log("正在port8080運行。。。");
});

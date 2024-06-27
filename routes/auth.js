const router = require("express").Router();
const registerValidation = require("../validation").registerValidation; //連到驗證器
const loginValidation = require("../validation").loginValidation;
const User = require("../model").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("正在接收一個auth的請求");
  next();
});

router.get("/textAPI", (req, res) => {
  return res.send("成功連結auth route。。。");
});

//註冊使用者
router.post("/register", async (req, res) => {
  //把使用者註冊的資料拿去驗證，如果有錯誤就把它存到error裡面
  let { error } = registerValidation(req.body);
  //並且把那裡的錯誤，回傳給使用者看
  if (error) return res.status(400).send(error.details[0].message);

  //確認信箱是否被註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已經被註冊過了。。。");

  //製作新用戶
  let { email, username, password, role } = req.body;
  let newUser = new User({ email, username, password, role });
  try {
    let saveUser = await newUser.save();
    return res.send({
      msg: "使用者成功儲存",
      saveUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者。。。");
  }
});

//登入使用者
router.post("/login", async (req, res) => {
  //把使用者註冊的資料拿去驗證，如果有錯誤就把它存到error裡面
  let { error } = loginValidation(req.body);
  //並且把那裡的錯誤，回傳給使用者看
  if (error) return res.status(400).send(error.details[0].message);

  //確認信箱是否被註冊過
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send("無法找到使用者。請確認信箱是否正確");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      //製作jwt
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        mseeage: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;

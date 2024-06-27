const router = require("express").Router();
const Course = require("../model").course;
const Users = require("../model").user;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("正在接收一個course的請求");
  next();
});

//獲取系統中所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      //這裡是找到instructor的_id，所存在mongodb的資料
      .populate("instructor", ["username", "email"]) //populate是mongodb內建function，用來查看_id的資料
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用講師id尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let coursesFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

//用學生id來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let coursesFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(coursesFound);
});

//用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程");
    } else {
      return res.send(courseFound);
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程");
    } else {
      return res.send(courseFound);
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  //驗證課程數據都符合，設定的格式
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //判斷使用者是不是講師
  if (req.user.isStudent()) {
    //如果使用者是學生
    return res.status(400).send("只有講師才能發布課程");
  }

  //創建課程
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id, //講師一定要是已經在passport驗證過的mongodb給的_id
    });
    let savedCourse = await newCourse.save();
    return res.send("新課程已經保存");
  } catch (e) {
    return res.status(500).send("無法創建課程。。。");
  }
});

//讓學生透過課程id來註冊課程
router.post("/enroll/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id); //因為這裡已經有受到jwt保護，所以使用者要拿token才能到這裡，再token裡面就會有使用者的_id，所以可以使用req.user._id
    await course.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

//更改課程
router.patch("/:_id", async (req, res) => {
  //驗證課程數據都符合，設定的格式
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) {
      return res.status(400).send("找不到課程");
    }

    //使用者必須是此課程講師，才能編輯課程
    //再找到的這堂課程的講師的_id，equals(等於)，目前登入的使用者的_id有沒有依樣
    if (courseFound.instructor.equals(req.user._id)) {
      let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "課程已經被更新成功",
        updateCourse,
      });
    } else {
      return res.status(403).send("只有此課程的講師才能編輯課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程，無法刪除課程");
    }

    //使用者必須是此課程講師，才能刪除課程
    //再找到的這堂課程的講師的_id，equals(等於)，目前登入的使用者的_id有沒有依樣
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已經被刪除成功");
    } else {
      return res.status(403).send("只有此課程的講師才能刪除課程");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});
module.exports = router;

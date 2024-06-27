const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

//使用者資料庫
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    mxalength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    //身分
    type: String,
    enum: ["student", "instructor"], //身分選擇
    required: true,
  },
  courses: {
    type: [String],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now, //預設是現在時間
  },
});

//instance methods，在這model都能使用的method
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, cb) {
  //cb是callback function
  //用來驗證使用者給的密碼是否跟資料庫儲存的密碼相同，相同就回傳true，不是就false
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    //result的結果密碼正確就是true，不正確就是false
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

//mongoose middlewares
//在userSchema，save儲存使用者之前要去做的事情
//而我們要做的事情是，如果使用者為新用戶，或者是正要更改密碼，則須將密碼進行雜湊處理
userSchema.pre("save", async function (next) {
  //this 代表 mongoDB內部的document文件
  //如果是全新的或是密碼有做更動
  if (this.isNew || this.isModified("password")) {
    //都要去將密碼進行雜湊處理
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next(); //把控制全交給下一個middleware
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

//課程資料庫
const courseSchema = new Schema({
  id: { type: String },
  title: {
    type: String,
    required: true,
  },
  description: {
    //課程描述
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    //課程講師
    //這裡是要連到mongodb給的_id
    type: mongoose.Schema.Types.ObjectId, //在mongoose裡面設定的primary key，(ObjectId==primary key)
    ref: "User", //會連結到User
  },
  //註冊的學生
  students: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);

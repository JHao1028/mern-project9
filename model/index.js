//只要有人require這個model就會得到以下兩個models
//在最外層的index.js只要連到這個model資料夾就可以取得這兩個model
module.exports = {
  user: require("./user-model"),
  course: require("./course-model"),
};

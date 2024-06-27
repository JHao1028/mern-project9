module.exports = {
  auth: require("./auth"),
  course: require("./course-route"),
};
//設定auth這個屬性，把./auth這個位置連到這個屬性上
//之後要取得這個route，只要連到這個routes資料夾加上auth這個屬性就可以找到這個route

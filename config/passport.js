let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../model").user;

//在index.js那邊，如果有執行檔案，就會自動加入passport套件
module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    //JwtStrategy是可以讓使用者把token拿回來的時候，給他儲存在mongodb的資料
    new JwtStrategy(opts, async function (jwt_payload, done) {
      // console.log(jwt_payload); 可以去看拿到使用者儲存的資料，以及mogodb給的_id
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec(); //拿到存在mongodb給的_id
        if (foundUser) {
          return done(null, foundUser); //把foundUser的值帶到req,user
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};

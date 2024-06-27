const Joi = require("joi");

//註冊驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    //設定資料的格式
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).max(50).required().email(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().required().valid("student", "instructor"), //只能填學生或是講師
  });

  return schema.validate(data); //return 使用者註冊的格式是否正確，錯誤會回傳錯誤的地方
};

//登入驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).required().email().messages({
      "string.empty": "信箱不能空白",
      "string.email": "信箱格式不對",
      "string.min": "信箱最少6個字",
      "any.required": "信箱必須填寫",
    }),
    password: Joi.string().min(6).max(255).required().messages({
      "string.base": `不能輸入中文`,
      "string.empty": `密碼不能空白`,
      "string.min": `密碼至少6個數`,
      "any.required": `密碼必須填寫`,
    }),
  });

  return schema.validate(data);
};

//課程驗證
const courseValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(50).required().messages({
      "string.empty": "標題不能空白",
      "string.min": "標題最少6個字",
      "any.required": "標題必須填寫",
    }),
    description: Joi.string().min(6).max(50).required().messages({
      "string.empty": "內容不能空白",
      "string.min": "內容最少6個字",
      "any.required": "內容必須填寫",
    }),
    price: Joi.number().min(10).max(9999).required().messages({
      "number.min": "價格最少10元",
      "any.required": "價格必須填寫",
    }),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courseValidation = courseValidation;

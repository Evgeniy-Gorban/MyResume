const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().min(4).max(20).required(),
  password: Joi.string().min(4).max(20).required(),
});

function validateRegister(data) {
  const { error } = registerSchema.validate(data);
  if (error) {
    let errorMessage = {};
    error.details.forEach((detail) => {
      if (detail.path.includes("username")) {
        errorMessage.username = "Логін повинен бути від 4 до 20 символів";
      }
      if (detail.path.includes("password")) {
        errorMessage.password = "Пароль повинен бути від 4 до 20 символів";
      }
    });
    return errorMessage;
  }
  return null;
}
module.exports = { validateRegister };

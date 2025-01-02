const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Заповніть поле для логіну",
    "any.required": "Заповніть поле для логіну",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Заповніть поле для паролю",
    "any.required": "Заповніть поле для паролю",
  }),
});

function validateLogin(data) {
  const { error } = loginSchema.validate(data);
  if (error) {
    let errorMessage = {};
    error.details.forEach((detail) => {
      if (detail.path.includes("username")) {
        errorMessage.username = detail.message;
      }
      if (detail.path.includes("password")) {
        errorMessage.password = detail.message;
      }
    });
    return errorMessage;
  }
  return null;
}
module.exports = { validateLogin };

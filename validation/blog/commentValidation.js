const Joi = require("joi");

const commentSchema = Joi.object({
  text: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Заповніть текст для коментаря",
    "any.required": "Заповніть текст для коментаря",
    "string.min": "Коментар повинен містити щонайменше {#limit} символів",
    "string.max": "Коментар не може перевищити {#limit} символів",
  }),
});

function validateComment(data) {
  const { error } = commentSchema.validate(data);
  if (error) {
    let errorMessage = {};
    error.details.forEach((detail) => {
      if (detail.path.includes("text")) {
        errorMessage.text = detail.message;
      }
    });
    return errorMessage;
  }
  return null;
}

module.exports = { validateComment };

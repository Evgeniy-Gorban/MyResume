const Joi = require("joi");

const blogSchema = Joi.object({
  title: Joi.string().min(4).max(30).required().messages({
    "string.empty": "Заповніть поле титула",
    "any.required": "Заповніть поле титула",
    "string.min": "Титул повинен містити щонайменше {#limit} символів",
    "string.max": "Титул не може перевищувати {#limit} символів",
  }),
  description: Joi.string().min(10).max(200).required().messages({
    "string.empty": "Заповніть поле опису",
    "any.required": "Заповніть поле опису",
    "string.min": "Опис повинен містити щонайменше {#limit} символів",
    "string.max": "Опис не може перевищувати {#limit} символів",
  }),
  img: Joi.string().uri().allow("").messages({
    "string.uri": "Введіть правильні URL адресу зображення",
  }),
});

function validateBlog(data) {
  const { error } = blogSchema.validate(data);
  if (error) {
    let errorMessage = {};
    error.details.forEach((detail) => {
      if (detail.path.includes("title")) {
        errorMessage.title = detail.message;
      }
      if (detail.path.includes("description")) {
        errorMessage.description = detail.message;
      }
      if (detail.path.includes("img")) {
        errorMessage.img = detail.message;
      }
    });
    return errorMessage;
  }
  return null;
}

module.exports = { validateBlog };

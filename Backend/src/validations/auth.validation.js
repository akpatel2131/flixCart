const Joi = require("joi");
const { password } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().custom(password).required(),
  })
};

const login = {
  body:Joi.object().keys({
    email:Joi.string().required().email(),
    password:Joi.string().required(),
  })
};

module.exports = {
  register,
  login,
};

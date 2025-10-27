const Joi = require('joi');

exports.validateCreateNotification = (data) => {
  const schema = Joi.object({
    user: Joi.string().required(),
    store: Joi.string().optional(),
    type: Joi.string().required(),
    message: Joi.string().required(),
    email: Joi.string().email().optional()
  });
  return schema.validate(data);
};
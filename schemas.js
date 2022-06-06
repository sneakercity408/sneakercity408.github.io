const Joi = require('joi');


module.exports.shoeSchema = Joi.object({
    shoes: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().required(),
        brand: Joi.string().required(),
        size: Joi.string().required()
    }).required()
});

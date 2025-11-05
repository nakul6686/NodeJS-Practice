const Joi = require("joi");

// User registration validation schema
const userSchema = Joi.object({
    userName: Joi.string()
        .alphanum()
        .min(3)
        .max(30),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),


    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .lowercase()
        .required(),
})
.with('userName', 'password',)
.with('email', 'password')
.with('userName', 'email');
module.exports = { userSchema };
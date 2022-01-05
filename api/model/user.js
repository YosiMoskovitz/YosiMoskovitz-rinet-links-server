
import mongoose from 'mongoose';
import Joi from 'joi'

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
    password: { type: String, required: true },
    role: { type: String, default: 'user'},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    status: { type: String, default: 'pending'}
});

const User = mongoose.model('User', userSchema)

const validate = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        status: Joi.string(),
    });
    return schema.validate(user);
}

export{
    User,
    validate
} 

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
    role: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
});

const User = mongoose.model('User', userSchema)

const validate = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
    });
    return schema.validate(user);
}

export{
    User,
    validate
} 
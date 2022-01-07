
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
    lastPassChange: { type: Date, default: Date.now},
    role: { type: String, default: 'user'},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    status: { type: String, default: 'pending'},
    joined: { type: Date, default: Date.now},
    lastLogin: { type: Date}
});

userSchema.set('toJSON', {
    // virtuals: true, // convert _id to id
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

const User = mongoose.model('User', userSchema)

const validate = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
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
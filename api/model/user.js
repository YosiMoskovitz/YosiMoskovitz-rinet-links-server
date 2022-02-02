
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
    lastPassChange: { type: Date, default: Date.now },
    role: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Roles' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    zeout: { type: String, default: ''},
    street: { type: String, default: ''},
    city: { type: String, default: ''},
    phone: { type: String, default: ''},
    country: { type: String, default: ''},
    status: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Statuses' },
    joined: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false},
    createdVia: {type: String, default: 'Signup'}
});

userSchema.set('toJSON', {
    virtuals: true, // convert _id to id
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

userSchema.method('adminGetAll', function () {
    var obj = this.toJSON();
    //Rename fields

    let objectOrder = {
        'id': null,
        'email': null,
        'firstName': null,
        'lastName': null,
        'zeout': null,
        'country': null,
        'street': null,
        'city': null,
        'phone': null,
        'role': null,
        'status': null,
        'createdVia': null,
        'isEmailVerified': null,
        'joined': null,
        'lastLogin': null,
    }

    obj = Object.assign(objectOrder, obj);

    return obj;
});

const User = mongoose.model('User', userSchema)

const validate = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().pattern(passRegex).message({ "string.pattern.base": "Weak Password" }),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        zeout: Joi.string().allow(null, ''),
        country: Joi.string().allow(null, ''),
        street: Joi.string().allow(null, ''),
        city: Joi.string().allow(null, ''),
        phone: Joi.string().allow(null, ''),
        role: Joi.custom(ObjIdValidator),
        status: Joi.custom(ObjIdValidator),
    });
    return schema.validate(user);
}

const ObjIdValidator = (val, helper)=> {
    if (val === undefined) return true;
    if (mongoose.Types.ObjectId.isValid(val)) return true
    else return helper.message("Must Be A Valid ObjectId")
}

const passRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);

export {
    User,
    validate
} 
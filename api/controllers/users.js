
import bcrypt from 'bcrypt'
import { User, validate } from "../model/user.js"
import Status from "../model/statuses.js"
import Role from "../model/roles.js"
import Donation from '../model/donationes.js'
import Auth from '../middlewares/auth.js'
import { sendVerificationEmail } from './newUserVeri.js'
import Joi from 'joi';
import { passwordHasChangedEmail } from '../mail/mailFuncs.js'
import Axios from 'axios'
import dotenv from 'dotenv';
dotenv.config()

const errorObj = {
    code: 500,
    message: "SERVER_ERROR"
}

export default {
    recaptchaVeri: async (req, res) => {
        var { token } = req.body;
        var secret = process.env.RECAPTCHA_SECRET_KEY;
        var result = await Axios.post('https://www.google.com/recaptcha/api/siteverify', { token, secret })
        if (result.status === 200) {
            res.status(200).json({
                message: 'recaptcha_verified'
            })
        }
        else {
            res.status(400).json({
                message: result.message
            })
        }
    },
    signUp: (req, res) => {
        const { error } = validate(req.body);
        if (error) {
            errorObj.code = 400;
            errorObj.message = error.details[0].message;
            throw errorObj;
        }

        const { email, password, firstName, lastName } = req.body;
        User.findOne({ email }).then(async (user) => {
            if (user) {
                errorObj.code = 409;
                errorObj.message = "email_already_in_use!";
                throw errorObj;
            }

            var hashPass = await bcrypt.hash(password, 10);
            var status = await Status.findOne({ title: 'pending' });
            var role = await Role.findOne({ title: 'user' });
            const newUser = new User({
                email,
                password: hashPass,
                firstName,
                lastName,
                status: status._id,
                role: role._id,
            })
            const isSent = await sendVerificationEmail(newUser);
            if (isSent === 'OK') {
                await newUser.save();
                return true
            }
            else throw isSent;
        }).then(() => {
            res.status(200).json({
                message: 'New_User_Created'
            })
        }).catch((error) => {
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        });

    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            let user = await User.findOne({ email }).populate('role').populate('status');

            if (!user) {
                errorObj.code = 409;
                errorObj.message = "Auth_Failed";
                throw errorObj
            }
            if (user.status.title === 'pending') {
                errorObj.code = 409;
                errorObj.message = "awaiting_email_verification";
                throw errorObj
            }
            if (user.status.title === 'disabled') {
                errorObj.code = 409;
                errorObj.message = "account_Suspended";
                throw errorObj
            }
            let validPass = await bcrypt.compare(password, user.password)
            if (!validPass) {
                const error = {
                    code: 409,
                    message: "Auth_Failed"
                }
                throw error
            }

            user.lastLogin = Date.now();
            await user.save();

            const token = Auth.createToken(user);

            let data = {
                user: user.toJSON(),
                token,
            };

            var _user = data.user;
            const userDonationes = await Donation.find({ user: data.user.id });
            _user = { ..._user, donations: userDonationes };

            res.cookie('token', data.token, { httpOnly: true, sameSite: 'None', secure: true }). // 
                status(200).json({
                    user
                });
        } catch (error) {

            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message);
        }

    },
    logout: (req, res) => {
        res.cookie('token', null, { httpOnly: true, sameSite: 'None', secure: true, expires: new Date() })
        .status(200)
        .json({
            status: 'OK'
        })
    },
    userAuth: async (req, res) => {
        try {
            const foundUser = await User.findById(req.user.id).populate('role').populate('status');
            if (!foundUser) {
                errorObj.code = 404;
                errorObj.message = "USER_NOT_FOUND";
                throw errorObj;
            }
            var user = foundUser.toJSON();
            const userDonationes = await Donation.find({ user: user.id });
            user = { ...user, donations: userDonationes }
            res.status(200).json({
                user
            })
        } catch (error) {
            res.status(error.code).json({
                message: error.message
            })
        }
    },
    getUserByEmail: (req, res) => {
        const email = req.params.email;
        User.findOne({ email }).then((user) => {
            user != null ? res.status(302).json(user) : res.status(404).json('NOT_FOUND')
        }).catch((error) => {
            error
        })
    },
    getUsers: (req, res) => {
        User.find().then((usersData) => {
            var users = usersData.map((user) => {
                return user.adminGetAll();
            })
            res.status(200).json({
                users
            })
        }).catch(error => {
            if (!error.code) error.code = 500;
            if (!error.message) error.message = 'INTERNAL_ERROR'
            res.status(error.code).json(error.message)
        })
    },
    changePassword: async (req, res) => {
        try {
            const schema = Joi.object({
                oldPassword: Joi.string().required(),
                newPassword: Joi.string().required().
                    pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)).message({ "string.pattern.base": "Weak Password" })
            });

            const { error } = schema.validate(req.body);
            if (error) {
                const err = {
                    code: 400,
                    message: error.details[0].message
                }
                throw err
            }
            const { oldPassword, newPassword } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) {
                errorObj.code = 400;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };

            var isOldPassValid = await bcrypt.compare(oldPassword, user.password)
            if (!isOldPassValid) {
                errorObj.code = 409;
                errorObj.message = 'Invalid_old_pass';
                throw errorObj
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.lastPassChange = Date.now();
            await user.save();
            const result = await passwordHasChangedEmail(user);
            const emailError = result !== 'OK' ? result : null
            emailError ? console.error(emailError) : null;

            res.status(200).json({
                message: 'password_changed_successfully',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            //logout
            await user.delete();

            res.status(200).json({
                message: 'user_deleted',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },
    editUserDetailsAdmin: async (req, res) => {
        try {
            const schema = Joi.object({
                userId: Joi.string().required(),
                email: Joi.string().required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                zeout: Joi.string().allow(null, ''),
                country: Joi.string().allow(null, ''),
                city: Joi.string().allow(null, ''),
                street: Joi.string().allow(null, ''),
                phone: Joi.string().allow(null, ''),
                status: Joi.string(),
                role: Joi.string(),
            });

            const { error } = schema.validate(req.body);
            if (error) {
                const err = {
                    code: 400,
                    message: error.details[0].message
                }
                throw err
            }

            const { userId, firstName, lastName, zeout, country, city, street, phone, status, role } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                errorObj.code = 404;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };

            user.firstName = firstName;
            user.lastName = lastName;
            user.zeout = zeout,
                user.country = country,
                user.city = city,
                user.street = street,
                user.phone = phone,
                user.status = status;
            user.role = role;

            await user.save();


            res.status(200).json({
                message: 'Admin_user_updated_successfully',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },
    editUserDetails: async (req, res) => {
        try {
            const schema = Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                zeout: Joi.string().allow(null, ''),
                country: Joi.string().allow(null, ''),
                city: Joi.string().allow(null, ''),
                street: Joi.string().allow(null, ''),
                phone: Joi.string().allow(null, ''),
            });

            const { error } = schema.validate(req.body);
            if (error) {
                const err = {
                    code: 400,
                    message: error.details[0].message
                }
                throw err
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                errorObj.code = 4004;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };
            const { firstName, lastName, zeout, country, city, street, phone } = req.body;
            user.firstName = firstName;
            user.lastName = lastName;
            user.zeout = zeout,
                user.country = country,
                user.city = city,
                user.street = street,
                user.phone = phone,

                await user.save();


            res.status(200).json({
                message: 'user_updated_successfully',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },
    addUser: (req, res) => {
        const { error } = validate(req.body);
        if (error) {
            errorObj.code = 400;
            errorObj.message = error.details[0].message;
            throw errorObj;
        }

        const { email, password, firstName, lastName, zeout, country, city, street, phone, role, status } = req.body;
        User.findOne({ email }).then(async (user) => {
            if (user) {
                errorObj.code = 409;
                errorObj.message = "email_already_in_use!";
                throw errorObj;
            }

            var hashPass = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                password: hashPass,
                firstName,
                lastName,
                zeout, country, city, street, phone,
                status,
                role,
                createdVia: 'Admin'
            })
            await newUser.save();
            return true

        }).then(() => {
            res.status(200).json({
                message: 'Admin_New_User_Created'
            })
        }).catch((error) => {
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        });

    },
    deleteUserAdmin: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            if (!user) {
                errorObj.code = 404;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };
            await user.delete();

            res.status(200).json({
                message: 'Admin_user_deleted',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },

}



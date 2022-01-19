
import bcrypt from 'bcrypt'
import { User, validate } from "../model/user.js"
import Auth from '../middlewares/auth.js'
import { sendVerificationEmail } from './newUserVeri.js'
import Joi from 'joi';
import { passwordHasChangedEmail } from '../mail/mailFuncs.js'

var errorObj = {
    code: 500,
    message: "SERVER_ERROR"
}

export default {
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

            var hashPass = await bcrypt.hash(password, 10)
            const newUser = new User({
                email,
                password: hashPass,
                firstName,
                lastName,
            })
            await newUser.save();
            const isSent = await sendVerificationEmail(newUser);
            if (isSent === 'OK') return true
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
    login: (req, res) => {
        const { email, password } = req.body;
        User.findOne({ email }).then(async (user) => {
            if (!user) {
                errorObj.code = 409;
                errorObj.message = "Auth_Failed";
                throw errorObj
            }
            if (user.status === 'pending') {
                errorObj.code = 409;
                errorObj.message = "awaiting_email_verification";
                throw errorObj
            }
            if (user.status === 'disabled') {
                errorObj.code = 409;
                errorObj.message = "account_Suspended";
                throw errorObj
            }
            var validPass = await bcrypt.compare(password, user.password)
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

            return {
                user: user.toJSON(),
                token,
            };

        }).then((data) => {
            res.cookie('token', data.token, { httpOnly: true, sameSite: 'None', secure: true }). // 
                status(200).json({
                    user: data.user
                })
        }).catch((error) => {
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        });
    },
    logout: (req, res) => {
        res.clearCookie('token').status(200).json({
            status: 'OK'
        })
    },
    userAuth: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                errorObj.code = 404;
                errorObj.message = "USER_NOT_FOUND";
                throw errorObj
            }
            res.status(200).json({
                user: user.toJSON()
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
        User.find().then((users) => {
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
                pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)).message({"string.pattern.base":"Weak Password"})
            });

            const { error } = schema.validate(req.body);
            if (error) {
                const err = {
                    code: 400,
                    message: error.details[0].message
                }
                throw err
            }
            const {oldPassword, newPassword} = req.body;

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
            const emailError =  result !== 'OK' ? result : null
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
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
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

            const {userId, firstName, lastName, status, role} = req.body;

            const user = await User.findById(userId);
            if (!user) {
                errorObj.code = 400;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };

            user.firstName = firstName;
            user.lastName = lastName;
            user.status = status;
            user.role = role;
            
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
    editUserDetails: async (req, res) => {
        try {
            const schema = Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
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
                errorObj.code = 400;
                errorObj.message = 'USER_NOT_FOUND';
                throw errorObj
            };
            const {firstName, lastName} = req.body;
            user.firstName = firstName;
            user.lastName = lastName;

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

}



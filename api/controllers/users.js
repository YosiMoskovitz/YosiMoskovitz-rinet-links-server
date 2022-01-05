
import bcrypt from 'bcrypt'
import { User, validate } from "../model/user.js"
import Auth from '../middlewares/auth.js'
import { sendVerificationEmail } from './newUserVeri.js'

var errorObj = {
    code: 500,
    message: "SERVER_ERROR"
}

export default {
    signUp: (req, res) => {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const { email, password, firstName, lastName } = req.body;
        User.findOne({ email }).then(async (user) => {
            if (user) {
                errorObj.code = 409;
                errorObj.message = "Email already in use!";
                throw errorObj;
            } 

            var hashPass = await bcrypt.hash(password, 10)
            const newUser = new User({
                email,
                password: hashPass,
                firstName,
                lastName,
            })
            newUser.save();
            const isSent = await sendVerificationEmail(newUser);
            if (isSent === 'OK') return true
            else throw isSent;
        }).then(() => {
            res.status(200).json({
                message: 'New User Created'
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
                errorObj.message = "Auth Failed";
                throw errorObj
            }
            if (user.status === 'pending') {
                errorObj.code = 409;
                errorObj.message = "awaiting email verification";
                throw errorObj
            }
            if (user.status === 'disabled') {
                errorObj.code = 409;
                errorObj.message = "account Suspended";
                throw errorObj
            }
            var validPass = await bcrypt.compare(password, user.password)
            if (!validPass) {
                const error = {
                    code: 409,
                    message: "Auth Failed"
                }
                throw error
            }
            const token = Auth.createToken(user);
            return {
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            };

        }).then((user) => {
            res.cookie('token', user.token, { httpOnly: true, sameSite: 'None', secure: true }). // 
                status(200).json({
                    user: user.user
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
    getUserByEmail: (req, res) => {
        const email = req.params.email;
        User.findOne({ email }).then((user) => {
            user != null ? res.status(302).json(user) : res.status(404).json('NOT_FOUND')
        }).catch((error) => {
            error
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
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            })
        } catch (error) {
            res.status(error.code).json({
                error
            })
        }
    },
    getUsers: (req, res) => {
        User.find().then((users) => {
            res.status(200).json({
                users
            })
        }).catch(error => {
            if (!error.code) error.code = 500;
            if (!error.message) error.message = 'INTERNAL_ERROR'
            res.status(error.code).json({
                message: error.message
            })
        })
    },

}


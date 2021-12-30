
import bcrypt from 'bcrypt'
import User from "../model/user.js"
import Auth from '../middlewares/JwtAuth.js'


export default {
    signUp: (req, res) => {
        const { email, password, firstName, lastName } = req.body;
        User.findOne({ email }).then(async (user) => {
            if (user) {
                const error = {
                    code: 409,
                    message: "User already exist!"
                }
                throw error
            }
            var hashPass = await bcrypt.hash(password, 10)
            const newUser = new User({
                email,
                password: hashPass,
                firstName,
                lastName
            })
            return newUser.save()
        }).then(() => {
            res.status(200).json({
                message: 'New User Created '
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
                const error = {
                    code: 401,
                    message: "Auth Failed"
                }
                throw error
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
                },
                token
            };

        }).then((user) => {
            res.cookie('token', user.token, { httpOnly: true }).
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
        const email  = req.params.email;
        User.findOne({ email }).then((user) => {
            user != null ? res.status(302).json(user) : res.status(404).json('NOT_FOUND')
        }).catch((error) => {
            error
        })
    },
    userAuth: (req, res) => {
        const userID = req.user.id;
        User.findOne({ _id: userID }).then((user)=> {
            if (!user) {
                const error = {
                    code: 404,
                    message: "USER_NOT_FOUND"
                }
                throw error
            }
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
            })
        })
    },
    getUsers : (req, res) => {
        User.find().then((users) => {
            res.status(200).json({
                users
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        })
    }
    
}
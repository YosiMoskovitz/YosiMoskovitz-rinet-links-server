
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import Joi from 'joi'
import { User } from "../model/user.js"
import Token from '../model/restToken.js'
import { sendTokenMail } from '../mail/sendEmail.js'
import { passwordHasChanged } from '../mail/mailFuncs.js'



var invalidError = {
    code: 400,
    message: "invalid link or expired"
}


export default {
    sendResetEmail: async (req, res) => {
        try {
            const schema = Joi.object({ email: Joi.string().email().required() });
            const { error } = schema.validate(req.body);
            if (error) {
                invalidError.message = error.details[0].message;
                throw invalidError
            }
    
            const user = await User.findOne({ email: req.body.email });
            if (!user){
                invalidError.message = "user_with_given_email_doesn't_exist";
                throw invalidError
            } 

            const result = await sendTokenMail(
                '../mail/htmlTemplates/resetPass.html',
                'reset-password',
                "איפוס סיסמה לאתר Rinet Links",
                user
            );
            if (result === 200){
                res.status(200).json({
                    message: 'password reset link sent to your email account'
                });
            }
            else throw result

        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json({
                message: error.message
            });
        }
    },

    resetVerification: async (req, res) => {
        try {
            const user = await User.findById(req.body.userId);
            if (!user) throw invalidError;

            const token = await Token.findOne({
                userId: user._id,
                token: req.body.token,
            });
            if (!token) throw invalidError;

            await token.delete();

            const newToken = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            res.status(200).json({
                message: 'Reset Verified',
                renewalToken: newToken.token
            });

        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    },
    resetPassword: async (req, res) => {
        try {
            const schema = Joi.object({ userId: Joi.string().required(), token: Joi.string().required(), password: Joi.string().required() });
            const { error } = schema.validate(req.body);
            if (error) {
                const err = {
                    code: 400,
                    message: error.details[0].message
                }
                throw err
            }

            const user = await User.findById(req.body.userId);
            if (!user) throw invalidError;

            const token = await Token.findOne({
                userId: user._id,
                token: req.body.token,
            });
            if (!token) throw invalidError;

            user.password = await bcrypt.hash(req.body.password, 10);
            user.lastPassChange = Date.now();
            await user.save();
            await token.delete();

            const result = await passwordHasChanged(user);
            const emailError =  result !== 'OK' ? result : null

            res.status(200).json({
                message: 'password_reset_successfully',
                emailError
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    }

}
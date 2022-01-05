
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import Joi from 'joi'
import { User } from "../model/user.js"
import Token from '../model/restToken.js'
import { sendTokenMail } from '../mail/sendEmail.js'



const invalidError = {
    code: 400,
    message: "invalid link or expired"
}


export default {
    sendResetEmail: async (req, res) => {
        try {
            const schema = Joi.object({ email: Joi.string().email().required() });
            const { error } = schema.validate(req.body);
            if (error) throw invalidError.message = error.details[0].message;
    
            const user = await User.findOne({ email: req.body.email });
            if (!user) throw invalidError.message = "user with given email doesn't exist";

            const result = await sendTokenMail(
                '../mail/htmlTemplates/resetPass.html',
                'reset-password',
                "איפוס סיסמה לאתר Rinet Links",
                user
            );
            
            if (result === 200)

            res.status(200).json({
                message: 'password reset link sent to your email account'
            });

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
        console.log(req.body)
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
            await user.save();
            await token.delete();

            res.status(200).json({
                message: 'password reset successfully',
            });
        } catch (error) {
            if (!error.code) error.code = 500
            if (!error.message) error.message = 'SERVER_ERROR'
            res.status(error.code).json(error.message)
        }
    }

}
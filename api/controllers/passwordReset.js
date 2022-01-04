
// import * as cheerio from 'cheerio';
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import Joi from 'joi'
import { User } from "../model/user.js"
import Token from '../model/restToken.js'
import { sendEmail } from '../middlewares/mail.js'
import handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const invalidError = {
    code: 400,
    message: "invalid link or expired"
}


export default {
    sendResetEmail: async (req, res) => {
        try {
            const filePath = join(__dirname, '../mail/resetPass.html');
            const source = readFileSync(filePath, 'utf-8').toString();
            const template = handlebars.compile(source);


            const schema = Joi.object({ email: Joi.string().email().required() });
            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const user = await User.findOne({ email: req.body.email });
            if (!user)
                return res.status(400).send("user with given email doesn't exist");

            let token = await Token.findOne({ userId: user._id });
            if (!token) {
                token = await new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
            }

            const resetLink = `${process.env.BASE_URL}/reset-password/${user._id}/${token.token}`;

            const replacements = {
                token: resetLink,
            };
            const htmlToSend = template(replacements);

            await sendEmail(user.email, "איפוס סיסמה לאתר Rinet Links", resetLink, htmlToSend);

            res.status(200).json({
                message: 'password reset link sent to your email account'
            });
        } catch (error) {
            res.status(500).json({
                message: 'An error occurred',
                error: error.message
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
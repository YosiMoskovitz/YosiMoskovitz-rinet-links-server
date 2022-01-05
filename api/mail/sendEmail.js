
import crypto from 'crypto'
import Joi from 'joi'
import { User } from "../model/user.js"
import Token from '../model/restToken.js'
import { sendEmail } from './mailConfig.js'
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

export const sendTokenMail = async (HtmlPath, url, subject, user) => {
    try {
        const filePath = join(__dirname, HtmlPath);
        const source = readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.BASE_URL}/${url}/${user._id}/${token.token}`;

        const replacements = {
            username: user.firstName,
            token: link,
        };
        const htmlToSend = template(replacements);

        await sendEmail(user.email, subject, link, htmlToSend);

        return 200;

    } catch (error) {
        return error
    }
}

export const sendInfoMail = async (HtmlPath, subject, user, text) => {
    try {
        const filePath = join(__dirname, HtmlPath);
        const source = readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);

        const replacements = {
            username: user.firstName,
        };
        const htmlToSend = template(replacements);

        await sendEmail(user.email, subject, text, htmlToSend);

        return 200;

    } catch (error) {
        return error
    }
}
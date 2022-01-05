import nodemailer from 'nodemailer';
import { google } from "googleapis";
import dotenv from 'dotenv'
dotenv.config()

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

export const sendEmail = async (email, subject, text, html) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken
            }
        })

        const mailOptions = {
            from: `Rinet Links<${process.env.MAIL_USER}>`,
            to: email,
            subject,
            text,
            html
        };

        const results = await transport.sendMail(mailOptions)

         return results

    } catch (error) {
        return error
    }
}

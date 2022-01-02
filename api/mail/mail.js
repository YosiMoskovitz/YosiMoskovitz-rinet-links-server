import nodemailer from 'nodemailer';
import { google } from "googleapis";
import dotenv from 'dotenv'
dotenv.config()

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const gmail = google.gmail({
    version: 'v1',
    auth: oAuth2Client
})

export async function sendMail(req, res) {
//     gmail.users.messages.send({
//         userId: 'me',
//     })
//     .then((result)=> {
//         const labels = result.data.labels;
 

        
//     })
//     .catch((err)=> {
//         return console.log('The API returned an error: ' + err);
//    });

    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'servicerinetlinks@gmail.com',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken
            }
        })

        const mailOptions = {
            from: 'Service Rinet Links <servicerinetlinks@gmail.com>',
            to: '05276ym@gmail.com',
            subject: 'Api Test 2',
            text: 'this is a test mail send from rinet-links server using gmail api.',
            html: '<h1>this is a test mail send from rinet-links server using gmail api.</h1>'
        };

        const results = await transport.sendMail(mailOptions)
        // return results
        res.json(results)

    } catch (error) {
        console.log(error)
    }
}

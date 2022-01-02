
import express from 'express'
import Auth from '../middlewares/JwtAuth.js';

const router = express.Router();
const PATH = "/services/mail";

import  { sendMail }  from '../mail/mail.js'

router.get('/send', sendMail);

export default {
    PATH,
    router: router
}
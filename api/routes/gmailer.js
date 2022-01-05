
import express from 'express'
import Auth from '../middlewares/auth.js';

const router = express.Router();
const PATH = "/services/mail";

import  { sendEmail }  from '../mail/mailConfig.js'

router.get('/send', sendEmail);

export default {
    PATH,
    router: router
}

import express from 'express'
import Auth from '../middlewares/JwtAuth.js';

const router = express.Router();
const PATH = "/services/mail";

import  { sendEmail }  from '../middlewares/mail.js'

router.get('/send', sendEmail);

export default {
    PATH,
    router: router
}
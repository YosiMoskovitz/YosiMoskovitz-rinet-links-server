
import express from 'express'
import Auth from '../middlewares/JwtAuth.js';

const router = express.Router();
const PATH = "/services/mail";

import  { listLabels }  from '../mail/mail.js'

router.get('/send', listLabels);

export default {
    PATH,
    router: router
}

import express from 'express'
import { check } from 'express-validator';
const router = express.Router();
const PATH = "/password-reset";

import controller from '../controllers/passwordReset.js'


router.post('/sendEmail', [check("email").normalizeEmail()], controller.sendResetEmail);
router.post('/verifyReq', controller.resetVerification);
router.post('/new-password', controller.resetPassword);

export default {
    PATH,
    router: router
}
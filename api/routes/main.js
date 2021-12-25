
import express from 'express'
const router = express.Router();
import Auth from '../middlewares/JwtAuth.js'

const PATH = "/";

import controller from '../controllers/main.js'


router.get('/', Auth.checkAuth, controller.autoLogin);

export default {
    PATH,
    router
}
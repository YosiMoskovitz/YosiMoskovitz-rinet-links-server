
import express from 'express'
const router = express.Router();
const PATH = "/roles";

import controller from '../controllers/roles.js'
import Auth from '../middlewares/auth.js'

router.get('/', Auth.checkAuth, controller.getRoles);

export default {
    PATH,
    router: router
}
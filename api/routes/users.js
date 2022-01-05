
import express from 'express'
const router = express.Router();
const PATH = "/users";

import controller from '../controllers/users.js'
import Auth from '../middlewares/auth.js'
import { accountVerify } from '../controllers/newUserVeri.js'

router.post('/signup', controller.signUp);
router.post('/account-verification', accountVerify);
router.get('/auth',Auth.checkAuth, controller.userAuth);
router.get('/all', Auth.checkAuth, Auth.isAdmin, controller.getUsers)
router.post('/login', controller.login);
router.post('/logout', Auth.checkAuth, controller.logout);
router.get('/:email', controller.getUserByEmail);

export default {
    PATH,
    router: router
}
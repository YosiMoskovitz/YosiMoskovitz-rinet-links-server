
import express from 'express'
const router = express.Router();
const PATH = "/users";

import controller from '../controllers/users.js'
import Auth from '../middlewares/JwtAuth.js'


router.post('/signup', controller.signUp);
router.get('/auth',Auth.checkAuth, controller.userAuth);
router.get('/all', Auth.checkAuth, controller.getUsers)
router.post('/login', controller.login);
router.post('/logout', Auth.checkAuth, controller.logout);
router.get('/:email', controller.getUserByEmail);

export default {
    PATH,
    router: router
}
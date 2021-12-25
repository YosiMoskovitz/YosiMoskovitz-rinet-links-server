
import express from 'express'
const router = express.Router();
const PATH = "/users";

import controller from '../controllers/users.js'


router.post('/signup', controller.signUp);
router.post('/login', controller.login);
router.get('/:email', controller.getUserByEmail);

export default {
    PATH,
    router: router
}
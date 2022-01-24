
import express from 'express'
const router = express.Router();
const PATH = "/statuses";

import controller from '../controllers/statuses.js'
import Auth from '../middlewares/auth.js'

router.get('/', Auth.checkAuth, controller.getStatuses);

export default {
    PATH,
    router: router
}
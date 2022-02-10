import express from 'express'
const router = express.Router();
const PATH = "/donationes";

import controller from '../controllers/donationes.js'
import Auth from '../middlewares/auth.js'

router.get('/:userId', controller.getUserDonations);
router.get('/', Auth.checkAuth, Auth.isAdmin, controller.getAllDonations);
router.post('/new-donation/:userId', Auth.checkAuth, controller.addDonation);

export default {
    PATH,
    router: router
}

import express from 'express'
import Auth from '../middlewares/JwtAuth.js';

const router = express.Router();
const PATH = "/links";

import  Controller  from '../controllers/links.js'


router.get('/', Controller.getLinks);
router.get('/fullData', Controller.getLinksAndCategories);
router.get('/link:linkID', Controller.getLinkById);
router.get('/category:categoryId', Controller.getLinksByCategory);
router.post('/', Auth.checkAuth, Controller.addLink);
router.patch('/:linkID', Auth.checkAuth, Controller.updateLink);
router.delete('/:linkID', Auth.checkAuth, Controller.deleteLink);

export default {
    PATH,
    router: router
}
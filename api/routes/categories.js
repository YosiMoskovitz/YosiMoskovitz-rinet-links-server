
import express from 'express'
import Auth from '../middlewares/JwtAuth.js';

const router = express.Router();
const PATH = "/categories";

import controller from '../controllers/categories.js'


router.get('/', controller.getCategories);
router.get('/:categoryId', controller.getCategory);
router.post('/', Auth.checkAuth, controller.createCategory);
router.patch('/:categoryId', Auth.checkAuth, controller.updateCategory);
router.delete('/:categoryId', Auth.checkAuth, controller.deleteCategory)

export default {
    PATH,
    router: router
}
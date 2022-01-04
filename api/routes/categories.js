
import express from 'express'
import Auth from '../middlewares/auth.js';

const router = express.Router();
const PATH = "/categories";

import controller from '../controllers/categories.js'


router.get('/', controller.getCategories);
router.get('/:categoryId', controller.getCategory);
router.post('/', Auth.checkAuth, Auth.isAdmin, controller.createCategory);
router.patch('/:categoryId', Auth.checkAuth, Auth.isAdmin, controller.updateCategory);
router.delete('/:categoryId', Auth.checkAuth, Auth.isAdmin, controller.deleteCategory)

export default {
    PATH,
    router: router
}
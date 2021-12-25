
import express from 'express'
import { uploadFile } from '../controllers/googleDriveCopy.js'
import Auth from '../middlewares/JwtAuth.js';
import upload from '../middlewares/multer.js';


const router = express.Router();
const PATH = "/upload";

// import  Controller  from '../controllers/GDriveuplod.js'




// router.get('/', Controller.getLinks);
router.post('/', upload.single('file'), uploadFile);
// router.post('/', createFolder);

// router.patch('/:linkID', Auth.checkAuth, Controller.updateLink);
// router.delete('/:linkID', Auth.checkAuth, Controller.deleteLink);

export default {
    PATH,
    router: router
}
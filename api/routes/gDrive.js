
import express from 'express'
import gDriveAPI from '../controllers/gDrive.js'
import Auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';


const router = express.Router();
const PATH = "/gdrive-upload";


router.post('/file', Auth.checkAuth, Auth.isAdmin, upload.single('file'), gDriveAPI.uploadFile);
router.get('/folders', gDriveAPI.getFolders);


export default {
    PATH,
    router: router
}
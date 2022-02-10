
import multer from 'multer';

const storage = multer.memoryStorage();

export default multer({
    limits: { fileSize: 2147483647 },
    storage
});

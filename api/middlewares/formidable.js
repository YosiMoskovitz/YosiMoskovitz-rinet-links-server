import formidable from 'formidable';
import { uploadFile } from '../controllers/googleDriveCopy'

export const form = formidable({
    fileWriteStreamHandler: uploadFile,
  });

  form.parse(req, () => {
    res.writeHead(200);
    res.end();
  });

  return;
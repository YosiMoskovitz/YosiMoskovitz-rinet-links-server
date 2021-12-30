import { google } from "googleapis";
import { EventEmitter } from 'events'
import upload from '../api/middlewares/multer.js';
import * as fs from "fs";
import dotenv from 'dotenv'
dotenv.config()


const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
})


export const uploadFile = (req, res) => {

    let progress = 0
    const folderId = '1sbqc8E5T3r2jbZF1mIfPyXaPWnO4RLjT';
    const fileStream = fs.createReadStream(req.file.path)
    const progressEvent = new EventEmitter()

    var stats = fs.statSync(req.file.path)
    var fileSize = stats.size;

    fileStream.on('data', (chunk) => {
        progress += chunk.length / fileSize * 100;
        progressEvent.emit('progress', progress)
        console.log('progress', progress)
      })

    try {
        const fileMetadata = {
            name: req.file.filename,
            parents: [folderId]
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fileStream,
        };
        drive.files.create(
            {
                resource: fileMetadata,
                media,
                fields: "id",
            },
        ).then((response) => {
            //give public Permission
            const fileId = response.data.id;
            drive.permissions.create({
                fileId,
                requestBody : {
                    role: 'reader',
                    type: 'anyone'
                }
            })
            return fileId;
        }).then((fileId)=>{
            //get public url
            return drive.files.get({
                fileId,
                fields: 'webContentLink'
            })
        }).then((response)=> {
            console.log(response.data.webContentLink)
            return response
        });
    } catch (error) {
        console.log(error.message);
    }
};

export const deleteFile = (fileId) => {
    try {
        drive.files.delete({
            fileId
        }).then((response)=>{
            console.log(response.status)
            //should be 204 if succeeded
        })
    } catch (error) {
        console.log(error.message);
    }
};

export const createFolder = () => {
    var fileMetadata = {
        'name': 'Rintet-Links',
        'mimeType': 'application/vnd.google-apps.folder'
      };
      drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      }).then((response) => {
        console.log(response.data)
    });;
}



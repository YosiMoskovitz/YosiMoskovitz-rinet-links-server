import { google } from "googleapis";
import { PassThrough } from 'stream'
import dotenv from 'dotenv'
dotenv.config()


const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
})



export const uploadFile = (req, res) => {
    const folderId = '1sbqc8E5T3r2jbZF1mIfPyXaPWnO4RLjT';
    const bufferStream = new PassThrough();

    var fileSize = req.file.size;

    bufferStream.end(req.file.buffer);

    try {
        const fileMetadata = {
            name: req.file.originalname,
            parents: [folderId]
        };
        const media = {
            mimeType: req.file.mimetype,
            body: bufferStream,
            resumable: true
        };
        drive.files.create(
            {
                resource: fileMetadata,
                media,
                fields: "id",
            },
            {
                maxRedirects: 0,
                onUploadProgress: (evt) => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`${Math.round(progress)}% complete`);
                },
            },

        ).then((result) => {
            res.send(result)
        })

        // .then((response) => {
        //     console.log('yup')
        //     //give public Permission
        //     const fileId = response.data.id;
        //     drive.permissions.create({
        //         fileId,
        //         requestBody : {
        //             role: 'reader',
        //             type: 'anyone'
        //         }
        //     })
        //     return fileId;
        // }).then((fileId)=>{
        //     //get public url
        //     return drive.files.get({
        //         fileId,
        //         fields: 'webContentLink'
        //     })
        // }).then((response)=> {
        //     console.log(response.data.webContentLink)
        //     return response
        // });
    } catch (error) {
        console.log(error.message);
    }
};

export const deleteFile = (fileId) => {
    try {
        drive.files.delete({
            fileId
        }).then((response) => {
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



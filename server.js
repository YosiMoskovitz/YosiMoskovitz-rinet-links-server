
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

import links from './api/routes/links.js'
import users from './api/routes/users.js'
import categories from './api/routes/categories.js'
import googleDrive from './api/routes/gDrive.js'

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

mongoose.connection.on('connected', ()=> {
    console.log('mongoDB Connected!')
})

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({
    extended: false
}))

//dev cors allowance
const corsOptionsDelegate = (req, cb)=> {
    var corsOptions = {
        credentials: true,
        origin: "https://rinet-links-client.vercel.app",
      }
      cb(null, corsOptions)
}

// var allowlist = ['https://rinet-links-client.vercel.app/']
// var corsOptionsDelegate = (req, callback)=> {
//   var corsOptions;
//   if (allowlist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }

app.use(cors(corsOptionsDelegate));


app.use(links.PATH, links.router)
app.use(users.PATH, users.router);
app.use(categories.PATH, categories.router);
app.use(googleDrive.PATH, googleDrive.router)



app.use((req, res, next) => {
    const error = new Error('NOT FOUND!');
    error.status = 404
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    })
})

app.listen(process.env.PORT || 3001, ()=> console.log(`App running on ${process.env.PORT}`));



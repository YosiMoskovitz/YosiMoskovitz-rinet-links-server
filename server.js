
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

import main from './api/routes/main.js'
import links from './api/routes/links.js'
import users from './api/routes/users.js'
import categories from './api/routes/categories.js'
import GDriveupload from './api/routes/GDriveuplod.js'

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

//workAround cros error from react because of axios error
var whitelist = ['147.234.64.39',/** other domains if any */ ]
var corsOptions = {
  credentials: true,
  origin: (origin, callback)=> {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));


app.use(main.PATH, main.router)
app.use(links.PATH, links.router)
app.use(users.PATH, users.router);
app.use(categories.PATH, categories.router);
app.use(GDriveupload.PATH, GDriveupload.router)



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

app.listen(process.env.PORT || 3000, ()=> console.log(`App running on ${process.env.PORT}`));



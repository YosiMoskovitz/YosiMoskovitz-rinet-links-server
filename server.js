
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
import mailer from './api/routes/gmailer.js'
import resetPass from './api/routes/passwordRest.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 3001

mongoose.connect(process.env.MONGO_CONNECTION, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.on('connected', () => {
  console.log('mongoDB Connected!')
})

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({
  extended: false
}))

//dev cors allowance
// const corsOptions = (req, cb)=> {
//     var corsOptionsDelegate = {
//         corsOptionsDelegate: true,
//         origin: req.header('Origin'),
//       }
//       cb(null, corsOptionsDelegate)
// }

// var corsOptionsDelegate = (req, callback) => {
//     var corsOptions;
//     if (allowlist.includes(req.header.origin)) {
//         console.log(req.header('Origin'))
//         corsOptions = { credentials: true, origin: req.header.origin } // reflect (enable) the requested origin in the CORS response
//     } else {
//         new Error('Blocked By CORS!' + req.header)
//         corsOptions = { origin: false } // disable CORS for this request
//     }
//     callback(null, corsOptions) // callback expects two parameters: error and options
// }

var allowlist = [
  'https://rinet-links.vercel.app',
  'https://rinet-links-client-j675gdkog-yosimoskovitz.vercel.app',
  'https://rinet-links-client.vercel.app',
  'http://localhost:3000'
]

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (allowlist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Blocked By CORS!'))
    }
  }
}
app.use(cors(corsOptions));


app.use(links.PATH, links.router)
app.use(users.PATH, users.router);
app.use(categories.PATH, categories.router);
app.use(googleDrive.PATH, googleDrive.router);
app.use(mailer.PATH, mailer.router);
app.use(resetPass.PATH, resetPass.router)



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

app.listen(port, () => console.log(`Listening on Port ${port}`));



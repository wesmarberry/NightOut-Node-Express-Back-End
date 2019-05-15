const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const cors           = require('cors');
const session        = require('express-session')
require('dotenv').config();
require('./db/db');

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const corsOptions = {
  origin: process.env.REACT_CLIENT_URL, // when you deploy your react app, this is where you put the address,
  credentials: true, // allowing cookies to be sent with requests from the client (session cookie),
  optionsSuccessStatus: 200 // some legacy browsers IE11 choke on a 204, and options requests
}

app.use(cors(corsOptions));


const userController  = require('./controllers/userController');
const activityController  = require('./controllers/activityController');


app.use('/api/v1/activity', activityController);
app.use('/api/v1/user', userController);

app.listen(process.env.PORT, () => {
  console.log('listening on port '  + process.env.PORT);
});



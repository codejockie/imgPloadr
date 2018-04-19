require('dotenv').config();
const express = require('express');
const config = require('./server/configure');
const mongoose = require('mongoose');

let app = express();

global.Promise = mongoose.Promise;
const PORT = process.env.PORT || 3000;

const url = process.env.NODE_ENV === 'development'
    ? process.env.MONGODB_URL
    : process.env.MLAB_URL

app.set('views', __dirname + '/views');
app.set('port', PORT);
app = config(app);

mongoose.connect(url);

const server = app.listen(app.get('port'));
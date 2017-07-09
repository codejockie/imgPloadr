require('dotenv').config();
var express = require('express'),
    config = require('./server/configure'),
    app = express(),
    mongoose = require('mongoose');

global.Promise = mongoose.Promise;
const PORT = process.env.PORT || 3300

var url = process.env.NODE_ENV === 'development'
    ? process.env.MONGODB_URL
    : process.env.MLAB_URL

app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 3300);
app = config(app);

mongoose.connect(url);

var server = app.listen(app.get('port'));
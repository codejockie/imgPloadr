var path = require('path'),
    routes = require('./routes'),
    exphbs = require('express-handlebars'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    moment = require('moment'),
    multer = require('multer'),
    fs = require('fs');

module.exports = function (app) {
    app.engine('handlebars', exphbs.create({
        defaultLayout: 'main',
        layoutsDir: app.get('views') + '/layouts',
        partialsDir: [app.get('views') + '/partials'],
        helpers: {
            timeago: function (timestamp) {
                return moment(timestamp).startOf('minute').fromNow();
            },
            currentyear: function () {
                return new Date().getFullYear();
            }
        }
    }).engine);
    app.set('view engine', 'handlebars');

    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser('some-secret-value-here'));

    // Get defined routes from routes.js
    router = routes.initialise(express.Router());
    app.use('/', router);

    // Ensure the temporary upload folders exist 
    fs.exists(path.join(__dirname, '../public/upload/temp'), function (exist) {
        if (!exist) {
            fs.mkdir(path.join(__dirname, '../public/upload'), function (err) {
                console.log(err);
                fs.mkdir(path.join(__dirname, '../public/upload/temp'), function (err) {
                    console.log(err);
                });
            });
        }
    });
    
    app.use(express.static(path.join(__dirname, '../public')));

    if (process.env.NODE_ENV === 'development') {
        app.use(errorHandler());
    }

    return app;
};
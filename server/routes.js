const home = require('../controllers/home');
const image = require('../controllers/image');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../public')
    }
})
const upload = multer({ storage });

module.exports.initialise = function (router) {
    router.get('/', home.index);
    router.get('/images/:image_id', image.index);

    router.post('/images', upload.single('file'), image.create);
    router.post('/images/:image_id/like', image.like);
    router.post('/images/:image_id/comment', image.comment);

    router.delete('/images/:image_id', image.remove);

    // app.use('/', router);
    return router;
};
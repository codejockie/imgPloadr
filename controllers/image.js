const fs = require('fs');
const path = require('path');
const sidebar = require('../helpers/sidebar');
const Models = require('../models');
const md5 = require('md5');
const cloudinary = require('cloudinary');

const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME
} = process.env;

cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
});

module.exports = {
    index: function (req, res) {
        var viewModel = {
            image: {},
            comments: []
        };

        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function (err, image) {
            if (err) { throw err; }
            if (image) {
                image.views = image.views + 1;
                viewModel.image = image;
                image.save();

                Models.Comment.find({ image_id: image._id }, {}, { sort: { 'timestamp': 1 } },
                    function (err, comments) {
                        if (err) { throw err; }

                        viewModel.comments = comments;

                        sidebar(viewModel, function (viewModel) {
                            res.render('image', viewModel);
                        });
                    });
            } else {
                res.redirect('/');
            }
        });
    },
    create: function (req, res) {
        const {
            body: {
                description,
                title
            },
            file: {
                originalname: filename,
                path: imagePath
            }
        } = req;

        // Search for an image with the same filename by performing a find:            
        Models.Image.find({ filename }, (err, images) => {
            if (images.length > 0) {
                // if a matching image was found
                res.send({ error: 'Image exist'});
            } else {
                const ext = path.extname(filename).toLowerCase();

                if (ext == '.png' || ext == '.jpg' || ext == '.jpeg' || ext == '.gif') {
                    // Upload to Cloudinary server
                    cloudinary.uploader.upload(imagePath, (result) => {
                        const newImage = new Models.Image({
                            description,
                            filename,
                            title,
                            url: result.url
                        });

                        newImage.save((err, image) => {
                            console.log('Successfully inserted image: ' + image.filename);
                            res.redirect('/images/' + image.uniqueId);
                        })
                    });
                } else {
                    res.json(500, { error: "Only image files are allowed." });
                }
            }
        });
    },
    like: function (req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function (err, image) {
            if (!err && image) {
                image.likes = image.likes + 1;
                image.save(function (err) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json({ likes: image.likes });
                    }
                });
            }
        });
    },
    comment: function (req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function (err, image) {
            if (!err && image) {
                var newComment = new Models.Comment(req.body); newComment.gravatar = md5(newComment.email); newComment.image_id = image._id;
                newComment.save(function (err, comment) {
                    if (err) { throw err; }

                    res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                });
            } else {
                res.redirect('/');
            }
        });
    },
    remove: function (req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } }, function (err, image) {
            if (err) { throw err };

            Models.Comment.remove({ image_id: image._id }, function (err) {
                image.remove(function (err) {
                    if (!err) {
                        res.json(true);
                    } else {
                        res.json(false);
                    }
                });
            });
        });
    }
}
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path');
    
var ImageSchema = new Schema({
    description: { type: String },
    filename: { type: String },
    likes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now() },
    title: { type: String },
    views: { type: Number, default: 0 },
    url: { type: String }
});

ImageSchema.virtual('uniqueId')
    .get(function () {
        return this.filename.replace(path.extname(this.filename), '');
    });

module.exports = mongoose.model('Image', ImageSchema);
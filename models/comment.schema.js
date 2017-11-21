var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    comment: String,
    Location: String,
    imageLat: Number,
    ImageLon: Number,
    BluePrintX: Number,
    BluePrintY: Number
});

var CommentModel = mongoose.model('CommentModel', commentSchema);

module.exports = CommentModel;
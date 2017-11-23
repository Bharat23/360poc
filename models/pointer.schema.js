var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var pointerSchema = new Schema({
    x: Number,
    y: Number,
    xPerc: Number,
    yPerc: Number,
    tagId: String,
    offset: Number,
    imageId: String,
    imageUrl: String
});

var PointerModel = mongoose.model('PointerModel', pointerSchema);

module.exports = PointerModel;
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserPinSchema = new Schema({
    x: Number,
    y: Number,
    xPerc: Number,
    yPerc: Number,
    latitude: Number,
    longitude: Number,
    tagId: String
});

var UserPinModel = mongoose.model('UserPinModel', UserPinSchema);

module.exports = UserPinModel;
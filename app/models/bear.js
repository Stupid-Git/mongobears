// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BearSchema   = new Schema({
    timeStamp: Number,
    dateStamp: String,
    tdid: String,
    name: String,
    offer: {}
});

module.exports = mongoose.model('Bear', BearSchema);


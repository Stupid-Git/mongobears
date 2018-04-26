// app/models/uza.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UzaSchema   = new Schema({
    timeStamp: Number,
    dateStamp: String,
    tdid: String,
    name: String,
    bears: []
});

module.exports = mongoose.model('Uza', UzaSchema);


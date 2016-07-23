'use strict';

var mongoose=require("mongoose");
var Schema = mongoose.Schema;

var Chart = new Schema({
    title : String,
    data : Schema.Types.Mixed,
    authorId: String,
    voters: Schema.Types.Mixed
});

module.exports = mongoose.model('Chart', Chart);
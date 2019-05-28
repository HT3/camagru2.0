var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Comment = require('./comment');

// define the schema for our user model
var imgSchema = new mongoose.Schema({

    img             : { 
        data        : String,
        username    : String,
        like        : Number
    },
    comment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Img', imgSchema);
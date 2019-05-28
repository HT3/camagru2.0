var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our user model
var commentSchema = new mongoose.Schema({

    comment             : { 
        comment         : String,
        username        : String,
        imageid         : String
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
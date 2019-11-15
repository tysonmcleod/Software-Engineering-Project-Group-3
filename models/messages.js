var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
    {
        participants: [String], // only 2 elements
        messages: [String],
        senders: [String]
    }
);

//Export model
module.exports = mongoose.model('Messages', MessageSchema);
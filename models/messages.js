var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
    {
        participants: [String], // only 2 elements
        messages: [String],
        senders: [String],
        dates: [Date],
        lastMsgDate: Date
    }
);

//Export model
module.exports = mongoose.model('Messages', MessageSchema);
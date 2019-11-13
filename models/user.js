var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        firstname: {type: String, required: true, max: 100},
        surname: {type: String, required: true, max: 100},
    }
);

// Virtual for user's full name
// UserSchema
//     .virtual('name')
//     .get(function () {
//         return this.surname + ', ' + this.firstname;
//     });

//Export model
module.exports = mongoose.model('User', UserSchema);
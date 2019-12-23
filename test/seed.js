const {ObjectID} = require('mongodb');

const {User} = require('./../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [{
    _id: userOneID,
    firstname: "name1",
    lastname: "surname1",
    email: "person1@gmail.com",
    username: "username1",
    password: "person1PASSWORD"
}, {
    _id: userTwoID,
    firstname: "name2",
    lastname: "surname2",
    email: "person2@gmail.com",
    username: "username2",
    password: "person2PASSWORD"
}];

var addDummyUsers = (done) => {
    User.deleteMany({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {
    users,
    addDummyUsers
};
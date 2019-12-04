var express = require('express');
var router = express.Router();
var Messages = require('../models/messages');

// Create message
router.post('/', async (req, res) => {
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    const msg = req.body.message;
    const msgDate = new Date();

    console.log(sender + " sent to " + receiver + ":");
    console.log(msg);

    // Check if a conversation between sender and receiver already exists
    const chat = await Messages.findOne({$and: [{participants: sender}, {participants: receiver}]});

    // if it exists then add the message
    if (chat != null) {
        chat.messages.push(msg);
        chat.senders.push(sender);
        chat.dates.push(msgDate);
        chat.lastMsgDate = msgDate;

        try {
            const savedChat = await chat.save();
            console.log("Updated conversation between users " + sender + " and " + receiver);
            console.log(savedChat);
            res.redirect("/messages/" + sender + "/" + receiver);
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    } else {
        // otherwise create it from scratch
        const newChat = new Messages({
            participants: [sender, receiver],
            messages: [msg],
            senders: [sender],
            dates: [msgDate],
            lastMsgDate: msgDate
        });

        try {
            const newSavedChat = await newChat.save();
            console.log("New conversation between users " + sender + " and " + receiver);
            console.log(newSavedChat);
            res.redirect("/messages/" + sender + "/" + receiver);
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
});

// Get chats of user that is logged in
router.get('/all', async (req, res) => {
    const user = res.locals.user;
    const username = user.username;
    console.log("Display all conversations of user: " + username);
    try {
        const messages = await Messages.find({participants: username});
        console.log(messages);
        console.log(!messages.length);
        if (!messages.length)
            res.render("noMessages");
        res.render("messages", {results: messages, username: username})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

// Get chat between two users
// TODO: request params instead of path parameters
router.get('/:id1/:id2', async (req, res) => {
    const id1 = req.params.id1;
    const id2 = req.params.id2;
    console.log("Display messages between user: " + id1 + "and user: " + id2);
    try {
        const messages = await Messages.findOne({$and: [{participants: id1}, {participants: id2}]});
        console.log(messages);
        res.render("conversation", {results: messages, owner: id1, other: id2})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

module.exports = router;

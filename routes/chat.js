var express = require('express');
var router = express.Router();
var Messages = require('../models/messages');

// Create message
router.post('/', async (req, res) => {
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    const msg = req.body.message;
    const msgDate = new Date();

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
            console.log(savedChat);
            res.render("conversation", {results: savedChat, owner: sender, other: receiver});
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
            console.log(newSavedChat);
            res.render("conversation", {results: newSavedChat, owner: sender, other: receiver});
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
});

// Get chats of user that is logged in
router.get('/', async (req, res) => {
    const user = res.locals.user;
    const username = user.username;
    console.log("Display all conversations of user: " + username);
    try {
        const messages = await Messages.find({participants: username});
        console.log(messages);
        res.render("messages", {results: messages, username: username})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

// Get chat between two users
// TODO: later, obtain user id1 by session and get id2 as parameter
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

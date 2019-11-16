var express = require('express');
var mongoose = require('mongoose');
// var table = require('table');
var router = express.Router();
var Messages = require('../models/messages');

// Create message
router.post('/', async (req, res) => {
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    const msg = req.body.message;

    // Check if a conversation between sender and receiver already exists
    // ....

    // otherwise create it from scratch
    const chat = new Messages({
        participants: [sender, receiver],
        messages: [msg],
        sender: sender
    });

    try {
        const newChat = await chat.save();
        res.status(201).json(newChat)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
});

// Get chats of user with id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const messages = await Messages.find({participants: id});
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

// Get chat between two users
// TODO: later, obtain user id1 by session and get as parameter the id2
router.get('/:id1/:id2', async (req, res) => {
    const id1 = req.params.id1;
    const id2 = req.params.id2;
    try {
        const messages = await Messages.find({$and: [{participants: id1}, {participants: id2}]});
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

module.exports = router;

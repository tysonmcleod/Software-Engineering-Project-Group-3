var express = require('express');
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

router.get('/', async (req, res) => {
    try {
        const messages = await Messages.find();
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});

module.exports = router;

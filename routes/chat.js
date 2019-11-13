var express = require('express');
// var table = require('table');
var router = express.Router();
var Messages = require('../models/messages');

/* GET user conversations listing. */

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
    Messages.find(function (err, messages) {
        // if (err) return
        console.log(messages)
    });
    // res.send('All messages:');
    // Connect to the db
    // MongoClient.connect(url, function (err, db) {
    //
    //     // if(err) throw err;
    //     if (err) {
    //         console.log(err);
    //         res.sendStatus(500);
    //         return;
    //     }
    //     var dbo = db.db("carpooldb");
    //     dbo.collection('users').find({}).toArray(function(err, result) {
    //         // if (err) throw err;
    //         for user in result
    //         if (err) {
    //             console.log(err);
    //             res.sendStatus(500);
    //             return;
    //         }
    //         // t = table.table
    //         res.send(result);
    //         console.log(result);
    //         db.close();
    //         return;
    //     });
    // });
});

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://carpooladmin:carpooladmin123@cluster0-dbznl.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });

// router.get('/', function(req, res, next) {
//     res.send('Messages:');
//
//     // Connect to the db
//     client.connect(err => {
//         const collection = client.db("carpoolingdb").collection("users");
//         collection.find({}).toArray(function (err, result) {
//             if (err) throw err;
//             console.log(result);
//             client.close();
//         });
//         client.close();
//     });
// });

module.exports = router;

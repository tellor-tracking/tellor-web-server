const MongoClient = require('mongodb').MongoClient;

const URL = 'mongodb://localhost:27017';

let database = {};


MongoClient.connect(URL, (err, db)=> {
    if (err) {
        throw err;
    }
    console.log(`MongoDB connected! to ${URL}`);

    database.db = db;
});

module.exports = {
    insertTrackEvents: require('./events/write')(database)
};



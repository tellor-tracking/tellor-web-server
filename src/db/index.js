const MongoClient = require('mongodb').MongoClient;
const write = require('./events/write');
const read = require('./events/read');
const analyze = require('./events/analyze');

const URL = 'mongodb://localhost:27017';

let database = {};

function connect(cb) {
    if (database.db !== undefined) {
        cb && cb();
    }

    MongoClient.connect(URL, (err, db)=> {
        if (err) {
            throw err;
        }
        console.log(`MongoDB connected! to ${URL}`);

        database.db = db;
        cb && cb(db);
    });
}

function getDb() {
    return database.db;
}

module.exports = {
    connect,
    getDb,
    insertTrackEvents: write.insertTrackEventsWrap(database),
    getEvents: read.getEventsWrap(database),
    getEventCounts: analyze.getEventCountsWrap(database),
    getAllEventsCount: analyze.getAllEventsCountWrap(database),
};



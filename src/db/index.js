const MongoClient = require('mongodb').MongoClient;
const events = require('./events');

const URL = 'mongodb://localhost:27017';

let database;

function connect(cb) {
    if (database !== undefined) {
        cb && cb();
    }

    MongoClient.connect(URL, (err, db)=> {
        if (err) {
            throw err;
        }
        console.log(`MongoDB connected! to ${URL}`);

        database = db;
        cb && cb(db);
    });
}

function getDb() {
    return database
}

function provideDb(fnsObj) {
    for (let key of Object.keys(fnsObj)) {
        fnsObj[key] = fnsObj[key](()=> database)
    }

    return fnsObj;
}

module.exports = Object.assign({connect, getDb}, provideDb(events));



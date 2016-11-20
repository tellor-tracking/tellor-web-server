const MongoClient = require('mongodb').MongoClient;
const events = require('./events');
const applications = require('./applications');
const config = require('../../config');


const URL = `mongodb://${config.dbHost}/${config.dbName}`;

let database;

const exportObj = Object.assign({connect, getDb}, provideDb(events), provideDb(applications));

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

function getExportObj() {
    return exportObj
}

function provideDb(fnsObj) {
    for (let key of Object.keys(fnsObj)) {
        fnsObj[key] = fnsObj[key](getDb, getExportObj)
    }

    return fnsObj;
}

module.exports = exportObj;



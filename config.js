const rc = require('rc');
const crypto = require('crypto');
const pckg = require('./package.json');

let name = pckg.name;

if (process.env.NODE_ENV === 'test') {
    name += 'test';
}

module.exports = rc(name, { // default settings which can be overwritten with tellor-serverrc file
    "serverPort": process.env.NODE_ENV === 'production' ? 3000 : 4000,
    "dbHost": "localhost:27017",
    "dbName": "tellor",
    "authSecret": crypto.randomBytes(256).toString('base64'),
    "defaultUser": "admin",
    "defaultUserPassword": "admin"
});
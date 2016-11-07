const rc = require('rc');
const pckg = require('./package.json');

let name = pckg.name;

if (process.env.NODE_ENV === 'test') {
    name += 'test';
}

module.exports = rc(name, {
   "serverPort": 4000,
    "dbHost": "localhost:27017",
    "dbName": "tellor",
    "authSecret": "NeverShareYourSecret",
    "defaultUser": "Admin",
    "defaultUserPassword": "Admin"
});
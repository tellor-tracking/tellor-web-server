const db = require('./src/db');
const startServer = require('./src/server');

db.connect(() => startServer());


// TODO test, especially test error handling, what happens when various parts in system throw errors, return errors from db
// TODO setup testing environment, maybe add some travisCI
// TODO next, test front end (click around, maybe test store), add filters implementation, last style/design tweaks
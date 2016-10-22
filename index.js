const db = require('./src/db');
const startServer = require('./src/server');

db.connect(startServer);
const startServer = require('../../src/server');
const db = require('../../src/db/index');


let dbConnection;
let server;

before(done => {
    db.connect(connection => {
        dbConnection = connection;
        startServer(serv => {
            server = serv;
            global.serverUri = serv.info.uri;
            done();
        })
    });
});

after(done => {
    dbConnection.dropDatabase(() => {
        dbConnection.close(() => {
            server.stop(done);
        });
    })
});



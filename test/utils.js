const startServer = require('../src/server');
const db = require('../src/db');


function connectToDbAndServer(done) {
    let dbConnection;
    let server;

    db.connect(connection => {
        dbConnection = connection;
        startServer(serv => {
            server = serv;

            done({
                _serverUri: serv.info.uri,
                _onAfter(done) {
                    dbConnection.dropDatabase(() => {
                        dbConnection.close(() => {
                            server.stop(done);
                        });
                    })

                }
            });
        })
    });
}

module.exports = {
    connectToDbAndServer
};
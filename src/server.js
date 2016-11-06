const Hapi = require('hapi');
const Good = require('good');
const config = require('../config');

const routes = require('./routes');

const server = new Hapi.Server();

server.connection({port: config.serverPort, routes: {cors: true}});
server.route(routes);


if (process.env.NODE_ENV !== 'test') {
    server.register({
        register: Good,
        options: {
            reporters: {
                console: [{
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{
                        response: '*',
                        log: '*'
                    }]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }
    }, (err) => {

        if (err) {
            throw err; // something bad happened loading the plugin
        }
    });
}

module.exports = (cb) => {
    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
        cb && cb(server);
    });
};
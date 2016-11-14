const Hapi = require('hapi');
const Good = require('good');
const JWTAuth = require('hapi-auth-jwt2');
const inert = require('inert');
const auth = require('./lib/auth');
const config = require('../config');
const path = require('path');

const routes = require('./routes');

const server = new Hapi.Server();

server.connection({
    port: config.serverPort,
    routes: {
        cors: {
            origin: ['*'],
            maxAge: 86400,
            headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
            exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Authorization'],
            credentials: true
        },
        files: {
            relativeTo: path.join(__dirname, '../public')
        }
    }
});


server.register(inert, (err) => {

    if (err) {
        throw err;
    }

    // serve static files
    server.route({
        method: 'GET',
        path: '/public/{filename*}',
        config: {auth: false},
        handler: {
            file(request) {
                return request.params.filename;
            }
        }
    });


});

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
            throw err;
        }
    });


    server.register(JWTAuth, (err) => {
        if (err) {
            throw err;
        }

        server.auth.strategy('jwt', 'jwt',
            {
                key: config.authSecret,
                validateFunc: auth.validate,
                verifyOptions: {algorithms: ['HS256']}
            });


        server.auth.default('jwt');
        server.route(routes);
    });
} else {
    server.route(routes);
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
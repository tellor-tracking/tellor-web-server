const Hapi = require('hapi');
const Good = require('good');
const JWTAuth = require('hapi-auth-jwt2');
const auth = require('./lib/auth');
const config = require('../config');

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
        }
    }
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
            throw err; // something bad happened loading the plugin
        }
    });


    server.register(JWTAuth, function(err) {
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

    server.ext('onPreResponse', (request, reply) => {
        /*        if (request.response.isBoom && request.response.output.statusCode === 401) { // unauthorized
         return reply.redirect('/login');
         }*/
        reply.continue()
    })
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
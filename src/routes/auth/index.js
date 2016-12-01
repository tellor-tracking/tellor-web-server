const jwt = require('jwt-simple');
const config = require('../../../config');
const Boom = require('boom');

const authenticate = {
    method: 'POST',
    path: '/authenticate',
    config: {auth: false},
    handler(request, reply) {
        const {account, password} = request.payload;


        if (config.defaultUser !== account || config.defaultUserPassword !== password) {
            return reply(new Boom.badData('Bad credentials'));
        }

        reply({isSuccessful: true, account: account})
            .header('Authorization', jwt.encode({account, password}, config.authSecret));
    }
};

const simpleAuthValidate = {
    method: 'GET',
    path: '/authcheck',
    handler(request, reply) {
        // this in an empty route, but under auth, so it can be used to validate from client side if user is authenticated

        reply({})
    }
};

module.exports = [authenticate, simpleAuthValidate];

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

module.exports = [authenticate];

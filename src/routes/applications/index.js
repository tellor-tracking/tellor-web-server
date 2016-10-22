const db = require('../../db');
const Boom = require('boom');

const registerApplication = {
    path: '/api/applications',
    method: 'POST',
    handler(request, reply) {

        if (!request.payload.name) {
            return reply(Boom.badData('You must provide name'))
        }

        db.registerApplication(request.payload.name, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to register new application', err));
            }
            reply(docs);
        });
    }
};

module.exports = [registerApplication];
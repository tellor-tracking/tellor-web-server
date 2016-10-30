const db = require('../../db');
const Boom = require('boom');

const getEvents = {
    path: '/api/applications/{appId}/events',
    method: 'GET',
    handler(request, reply) {

        db.getEvents(request.params.appId, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to retrieve events', err));
            }
            reply(docs);
        });
    }
};

module.exports = [getEvents];
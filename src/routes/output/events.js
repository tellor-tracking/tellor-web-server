const db = require('../../db');
const Boom = require('boom');

const getEvents = {
    path: '/api/applications/{appId}/events',
    method: 'GET',
    handler(request, reply) {

        db.getEvents(request.params.appId)
            .then(docs => reply(docs))
            .catch(err  => reply(Boom.badImplementation('Failed to retrieve events', err)));
    }
};

module.exports = [getEvents];
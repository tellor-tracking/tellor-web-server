const db = require('../../db');
const Boom = require('boom');

const getEventCount = {
    path: '/api/events/{id}/count',
    method: 'GET',
    handler(request, reply) {

        db.getEventStats(request.params.id, request.query)
            .then((err, docs) => reply(docs))
            .catch(err => reply(Boom.badImplementation('Failed to retrieve event count', err)));

    }
};


module.exports = [getEventCount];
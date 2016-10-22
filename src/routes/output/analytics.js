const db = require('../../db');
const Boom = require('boom');

const getEventCount = {
    path: '/api/events/{id}/count',
    method: 'GET',
    handler(request, reply) {
        db.getEventCounts(request.params.id, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to retrieve event count', err));
            }
            reply(docs);
        });
    }
};

const getAllEventsCount = {
    path: '/api/{appId}/events/count',
    method: 'GET',
    handler(request, reply) {
        db.getAllEventsCount(request.params.appId, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to retrieve all events count', err));
            }
            reply(docs);
        });
    }
};

module.exports = [getEventCount, getAllEventsCount];
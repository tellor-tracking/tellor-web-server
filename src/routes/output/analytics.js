const db = require('../../db');
const Boom = require('boom');

const getEventCount = {
    path: '/api/events/{id}/count',
    method: 'GET',
    handler(request, reply) {

        const eventId = request.params.id;
        const {startDate, endDate} = request.query;

        db.getEventCounts({eventId, startDate, endDate}, (err, docs) => {
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

        const appId = request.params.appId;
        const {startDate, endDate} = request.query;

        db.getAllEventsCount({appId, startDate, endDate}, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to retrieve all events count', err));
            }
            reply(docs);
        });
    }
};

module.exports = [getEventCount, getAllEventsCount];
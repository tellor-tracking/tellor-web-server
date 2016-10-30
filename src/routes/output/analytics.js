const db = require('../../db');
const Boom = require('boom');

const getEventCount = {
    path: '/api/events/{id}/count',
    method: 'GET',
    handler(request, reply) {
        if ((Object.keys(request.query).every(key => key === 'startDate' || key === 'endDate'))) {
            getEventCountHandler(request, reply);
        } else {
            //getEventCountByQueryHandler(request, reply)
        }

    }
};

function getEventCountHandler(request, reply) {
    const eventId = request.params.id;
    const {startDate, endDate} = request.query;

    db.getEventCounts({eventId, startDate, endDate}, (err, docs) => {
        if (err) {
            return reply(Boom.badImplementation('Failed to retrieve event count', err));
        }
        reply(docs);
    });
}

function getEventCountByQueryHandler(request, reply) {
    const eventId = request.params.id;
    const query = request.query;

    db.getEventCountsByFilters({eventId, query}, (err, docs) => {
        if (err) {
            return reply(Boom.badImplementation('Failed to retrieve event count', err));
        }

        reply(docs);
    });
}

module.exports = [getEventCount];
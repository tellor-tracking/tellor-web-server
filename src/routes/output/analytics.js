const db = require('../../db');
const {handler} = require('../../lib/apiErrorHandler');

const getEventCount = {
    path: '/api/events/{id}/stats',
    method: 'GET',
    handler: handler((request, reply) => (
        db.getEventStats(request.params.id, request.query)
            .then(docs=> reply(docs))
    ))
};


module.exports = [getEventCount];
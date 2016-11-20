const db = require('../../db');
const {handler} = require('../../lib/apiErrorHandler');

const getEvents = {
    path: '/api/applications/{appId}/events',
    method: 'GET',
    handler: handler((request, reply) => (
        db.getEvents(request.params.appId)
            .then(docs => reply(docs))
    ))
};

module.exports = [getEvents];
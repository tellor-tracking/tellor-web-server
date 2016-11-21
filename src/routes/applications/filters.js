const db = require('../../db');
const Boom = require('boom');
const {handler} = require('../../lib/apiErrorHandler');


const addEventsFilter = { // TODO add password for creation
    path: '/api/applications/{id}/eventsFilters',
    method: 'POST',
    handler: handler((request, reply) => {

        if (!request.payload && !request.payload.eventFilter && !request.payload.eventFilter.filterValue) {
            return reply(Boom.badData('You must provide eventFilter.filterValue'))
        }

        const id = request.params.id;

        return db.validateApplicationId(id)
            .then(() => db.addEventsFilter(id, request.payload.eventFilter))
            .then(({id, res}) => reply({isSuccessful: true, id, res}));
    })
};


const removeEventsFilter = {
    path: '/api/applications/{appId}/eventsFilters/{id}',
    method: 'DELETE',
    handler: handler(({params: {appId, id}, payload}, reply) => (
            db.authenticateApplication(appId, payload ? payload.password : '')
                .then(() => db.validateFilterId(appId, id))
                .then(() => db.deleteEventsFilter(appId, id))
                .then(res => reply({isSuccessful: true}))
        )
    )
};

module.exports = [addEventsFilter, removeEventsFilter];
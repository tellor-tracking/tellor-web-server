const db = require('../../db');
const Boom = require('boom');
const {handler} = require('../../lib/apiErrorHandler');

const getSingleApplication = {
    path: '/api/applications/{appId}',
    method: 'GET',
    handler: handler((request, reply) => (
            db.getApplication(request.params.appId)
                .then(docs => reply(docs))
        )
    )
};


const getApplications = {
    path: '/api/applications',
    method: 'GET',
    handler: handler((request, reply) => (
            db.getApplications()
                .then(docs => reply(docs))
        )
    )
};

const registerApplication = {
    path: '/api/applications',
    method: 'POST',
    handler: handler(({payload}, reply) => {

            if (!payload || !payload.name) {
                return reply(Boom.badData('You must provide name'));
            }

            return db.registerApplication(payload.name, payload.password)
                .then(docs => reply(docs));
        }
    )
};

const removeApplication = {
    path: '/api/applications/{id}/remove',
    method: 'DELETE',
    handler: handler((request, reply) => {

        const id = request.params.id;

        return db.authenticateApplication(id, request.payload.password)
            .then(() => db.removeApplication(id))
            .then(() => reply({_id: id, isRemoved: true}));  // TODO -> isSuccessful
    })
};

const addEventsFilter = {
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


module.exports = [registerApplication, removeApplication, getApplications, getSingleApplication, addEventsFilter, removeEventsFilter];
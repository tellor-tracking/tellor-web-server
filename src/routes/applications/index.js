const db = require('../../db');
const Boom = require('boom');

const getApplications = {
    path: '/api/applications',
        method: 'GET',
        handler(request, reply) {

        db.getApplications()
            .then(docs => {
                reply(docs);
            })
            .catch(err => reply(Boom.badImplementation('Failed to retrieve applications', err)));
    }
};

const registerApplication = {
    path: '/api/applications',
    method: 'POST',
    handler(request, reply) {

        if (!request.payload.name) {
            return reply(Boom.badData('You must provide name'))
        }

        db.registerApplication(request.payload.name, request.payload.password)
            .then(docs=> reply(docs))
            .catch(err => reply(Boom.badImplementation('Failed to register new application', err)))
    }
};

const removeApplication = {
    path: '/api/applications/{id}/remove',
    method: 'DELETE',
    handler(request, reply) {

        const id = request.params.id;
        db.authenticateApplication(id, request.payload.password)
            .then(() => db.removeApplication(id))
            .then(()=> reply({id, isRemoved: true}))
            .catch((error)=> reply({id: id, isRemoved: false, error: `${error}`}));
    }
};

const addEventsFilter = {
    path: '/api/applications/{id}/eventsFilters',
    method: 'POST',
    handler(request, reply) {

        const id = request.params.id;
        db.addEventsFilter(id, request.payload.eventFilter)
            .then(res=> reply({isSuccessful: true}))
            .catch(error => reply({error: `${error}`}));
    }
};

const deleteEventsFilter = {
    path: '/api/applications/{appId}/eventsFilters/{id}',
    method: 'DELETE',
    handler(request, reply) {

        const {appId, id} = request.params;

        db.deleteEventsFilter(appId, id)
            .then(res=> reply({isSuccessful: true}))
            .catch(error => reply({error: `${error}`}));
    }
};



module.exports = [registerApplication, removeApplication, getApplications, addEventsFilter, deleteEventsFilter];
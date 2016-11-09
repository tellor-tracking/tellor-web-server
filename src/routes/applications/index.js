const db = require('../../db');
const Boom = require('boom');

const getApplication = {
    path: '/api/applications/{appId}',
        method: 'GET',
        handler(request, reply) {

        db.getApplication(request.params.appId)
            .then(docs => {
                reply(docs);
            })
            .catch(err => reply(Boom.badImplementation('Failed to retrieve application', err)));
    }
};


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
        if (!request.payload && !request.payload.eventFilter && !request.payload.eventFilter.filterValue) {
            return reply(Boom.badData('You must provide eventFilter.filterValue'))
        }

        const id = request.params.id;
        db.isAppIdValid(id)
            .then((isValid) => {
                if (!isValid) return reply(Boom.badData('Invalid app id'));

                return db.addEventsFilter(id, request.payload.eventFilter)
                    .then(({id, res})=> reply({isSuccessful: true, id, res}))

            })
            .catch(error => reply(Boom.badData(error)));
    }
};

const removeEventsFilter = {
    path: '/api/applications/{appId}/eventsFilters/{id}',
    method: 'DELETE',
    handler(request, reply) {

        const {appId, id} = request.params;
        // TODO add auth with password, this is important enough
        db.isAppIdValid(appId)
            .then((isValid) => {
                if (!isValid) return reply(Boom.badData('Invalid app id'));
                return db.isFilterIdValid(appId, id)
                    .then((isValid) => {
                        if (!isValid) return reply(Boom.badData('Invalid filter id'));
                        return db.deleteEventsFilter(appId, id)
                            .then(res=> reply({isSuccessful: true}));

                    })
            })
            .catch(error => {console.log(error);return reply(Boom.badData(error))});
    }
};



module.exports = [registerApplication, removeApplication, getApplications, getApplication, addEventsFilter, removeEventsFilter];
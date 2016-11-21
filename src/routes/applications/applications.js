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

module.exports = [registerApplication, removeApplication, getApplications, getSingleApplication];
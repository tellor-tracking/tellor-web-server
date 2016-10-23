const db = require('../../db');
const Boom = require('boom');

const getApplications = {
    path: '/api/applications',
        method: 'GET',
        handler(request, reply) {

        db.getApplications((err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to retrieve applications', err));
            }
            reply(docs);
        });
    }
};

const registerApplication = {
    path: '/api/applications',
    method: 'POST',
    handler(request, reply) {

        if (!request.payload.name) {
            return reply(Boom.badData('You must provide name'))
        }

        db.registerApplication(request.payload.name, request.payload.password, (err, docs) => {
            if (err) {
                return reply(Boom.badImplementation('Failed to register new application', err));
            }
            reply(docs);
        });
    }
};

const removeApplication = {
    path: '/api/applications/{id}',
    method: 'POST',
    handler(request, reply) {

        const id = request.payload.id;
        db.authenticateApplication(id, request.payload.password)
            .then(() => db.removeApplication(id))
            .then(()=> reply({id:id, isRemoved: true}))
            .catch((error)=> reply({id: id, isRemoved: false, error: `${error}`}));
    }
};

module.exports = [registerApplication, removeApplication, getApplications];
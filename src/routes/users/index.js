const db = require('../../db');
const Boom = require('boom');

const createUser = {
    path: '/user/create',
    method: 'POST',
    handler(request, reply) {
        reply('TODO');
    }
};

const loginUser = {
    path: '/user/logout',
    method: 'GET',
    handler(request, reply) {
        reply('TODO');
    }
};

const logoutUser = {
    path: '/user/login',
    method: 'GET',
    handler(request, reply) {
        reply('TODO');
    }
};

module.exports = [createUser, loginUser, logoutUser];
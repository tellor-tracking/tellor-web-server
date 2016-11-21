const serveReactApp = {
    method: 'GET',
    path: '/{paths*}',
    config: {auth: false},
    handler(request, reply) {
        reply.file('react/index.html');
    }
};


const healthcheck = {
    method: 'GET',
    path: '/healthcheck',
    config: {auth: false},
    handler(request, reply) {
        reply('Server is up and running');
    }
};

module.exports = [serveReactApp, healthcheck];
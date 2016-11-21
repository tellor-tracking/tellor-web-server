const serveReactApp = {
    method: 'GET',
    path: '/{paths*}',
    config: {auth: process.env.NODE_ENV === 'test' ? false : {mode: 'optional'}},
    handler(request, reply) {
        if (request.path !== '/login' && !request.auth.isAuthenticated) {
            return reply.redirect('/login');
        }

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

module.exports = {
    path: '/api/events',
    method: 'GET',
    handler(request, reply) {
        reply({
            events: [
                {name: '...', segmentation: ['...', '...', '...'], duration: true, sum: false, description: false}
            ],
            meta: ['ip', 'appVersion', '...']
        });
    }
};
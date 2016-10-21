
const trackEvent = {
    method: 'GET',
    path: '/track',
    handler(request, reply) {
              reply('sup world!')
    }
};

module.exports = [
    trackEvent
];
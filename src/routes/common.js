const serveReactApp = {
    method: 'GET',
    path: '/{paths*}',
    config: {auth: false},
    handler: function(req, res) {
        res.file('react/index.html');
    }
};

module.exports = [serveReactApp];
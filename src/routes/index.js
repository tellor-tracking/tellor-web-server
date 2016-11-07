const inputRoutes = require('./input');
const outputRoutes = require('./output');
const applications = require('./applications');
const auth = require('./auth');

module.exports = [...inputRoutes, ...outputRoutes, ...applications, ...auth];

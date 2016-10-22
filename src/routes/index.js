const inputRoutes = require('./input');
const outputRoutes = require('./output');
const applications = require('./applications');

module.exports = [...inputRoutes, ...outputRoutes, ...applications];

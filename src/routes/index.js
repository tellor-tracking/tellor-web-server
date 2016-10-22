const inputRoutes = require('./input');
const outputRoutes = require('./output');
const applications = require('./applications');
const users = require('./users');

module.exports = [...inputRoutes, ...outputRoutes, ...applications, ...users];

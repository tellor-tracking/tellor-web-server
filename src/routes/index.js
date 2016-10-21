const inputRoutes = require('./input');
const outputRoutes = require('./output');

module.exports = [...inputRoutes, ...outputRoutes];

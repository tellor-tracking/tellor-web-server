const config = require('../../config');

function validate(decoded, request, callback) {
    callback(null, config.defaultUser === decoded.account && config.defaultUserPassword === decoded.password);
}

module.exports = {
    validate
};


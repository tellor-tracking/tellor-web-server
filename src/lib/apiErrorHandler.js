const Boom = require('boom');

function handler(handlerFn) {
    return (request, reply) => {
        let f;
        try {
            f = handlerFn(request, reply);
            if (f && f.then !== undefined) {
                f.catch(error => {
                    if (error.isBadDataError) {
                        reply(Boom.badData(error.message));
                    } else {
                        reply(Boom.badImplementation(error));
                    }
                });
            }
        } catch (e) {
            reply(Boom.badImplementation(e));
        }

        return f;
    }
}

class BadDataError extends Error {
    constructor(message = '') {
        super(message);
        this.isBadDataError = true;
    }
}

module.exports = {
    handler,
    BadDataError
};

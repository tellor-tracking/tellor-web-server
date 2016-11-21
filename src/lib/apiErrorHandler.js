const Boom = require('boom');
const log = require('../../logging');

function handler(handlerFn) {
    return (request, reply) => {
        let f;
        try {
            f = handlerFn(request, reply);
            if (f && f.then !== undefined) {
                f.catch(error => {
                    if (error.isBadDataError) {
                        log.warn(`Bad data error: ${error}`);
                        reply(Boom.badData(error.message));
                    } else {
                        log.error(`Promise error in handler: ${error}`);
                        reply(Boom.badImplementation(error));
                    }
                });
            }
        } catch (e) {
            log.error(`Error in handler: ${e}`);
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

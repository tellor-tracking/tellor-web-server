const moment = require('moment');
const db = require('../../db');
const {getFormattedTrackObjects, isAllFieldsPresent} = require('../../lib/eventsInput');


const getAnalyticsData = request => ({ip: request.raw.req.headers['x-real-ip']}); // since we are under reverse nginx proxy we save real ip in header

const trackEvent = {
    method: 'GET',
    path: '/track',
    config: {auth: false},
    handler(request, reply) {
        reply();

        if (!isAllFieldsPresent(request.query)) {
            return console.error('Not all arguments defined');
        }

        const appKey = request.query.app_key;

        db.validateApplicationId(appKey)
            .then(() => db.insertTrackEvents(
                appKey,
                getFormattedTrackObjects(request.query, getAnalyticsData(request), moment.utc().format())
            ))
            .catch(err => console.error('Track failed, due to error', err))
    }
};

module.exports = [trackEvent];
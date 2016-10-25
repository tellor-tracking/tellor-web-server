const Boom = require('boom');
const moment = require('moment');
const db = require('../../db');

function areAllFieldsPresent({sdk, events, app_key, app_version}) {
    return sdk && events && app_key && app_version;
}

function getUtcTimeStamp() {
    return moment.utc().format();
}

function getAnalyticsData(request) {
    return {
        ip: request.info.remoteAddress
    }
}

function formatTrackObjectFactory(sdk, appId, appVersion, analytics, timestamp) {
    const additionalData = Object.assign({}, analytics, {timestamp, sdk, appVersion});
    return (eventData) => {
        // TODO validate eventData (or better do it client side)
        return Object.assign(eventData, {meta: additionalData}, {appId}); // TODO implement data merging from client side and server side
    }; // TODO add ability to specify event group

}

function getFormattedTrackObjects(requestQuery, extractedAnalytics, utcTimeStamp) {
    const {sdk, events, app_version, app_key} = requestQuery;
    const eventsArray = JSON.parse(events);

    return eventsArray.map(formatTrackObjectFactory(sdk, app_key, app_version, extractedAnalytics, utcTimeStamp));
}

// TODO add validation for data structure and request itself
const trackEvent = {
    method: 'GET',
    path: '/track',
    handler(request, reply) {
        reply();

        if (!areAllFieldsPresent(request.query)) {
            return reply(Boom.badRequest('Not all arguments are defined'));
        }

        db.isAppIdValid(request.query.app_key, (err, isValid) => {
            console.log('isValid', err, isValid);
            if (!err && !isValid) return;

            const trackEvents = getFormattedTrackObjects(request.query, getAnalyticsData(request), getUtcTimeStamp());
            db.insertTrackEvents(trackEvents);
        });
    }
};

module.exports = [
    trackEvent
];
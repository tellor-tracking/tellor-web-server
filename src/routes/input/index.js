const Boom = require('boom');
const moment = require('moment');

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

function formatTrackObjectFactory(sdk, appVersion, analytics, timeStamp) {
    const additionalData = Object.assign({}, analytics, {timeStamp, sdk, appVersion});
    return (eventData) => {
        // TODO validate eventData (or better do it client side)
        return Object.assign(eventData, {meta: additionalData}); // TODO implement data merging from client side and server side
    };

}

function getFormattedTrackObjects(requestQuery, extractedAnalytics, utcTimeStamp) {
    const {sdk, events, app_version} = requestQuery;
    const eventsArray = JSON.parse(events); // TODO implement more efficient way to pass data, JSON is slow

    return eventsArray.map(formatTrackObjectFactory(sdk, app_version, extractedAnalytics, utcTimeStamp));
}

// TODO add validation for data structure and request itself
const trackEvent = {
    method: 'GET',
    path: '/track',
    handler(request, reply) {

        // TODO validate app key

        if (!areAllFieldsPresent(request.query)) {
            return reply(Boom.badRequest('Not all arguments are defined'));
        }

        const trackObject = getFormattedTrackObjects(request.query, getAnalyticsData(request), getUtcTimeStamp());

        //save to db, reply

        reply({info: request.info, query: request.query, trackObject})
    }
};

module.exports = [
    trackEvent
];
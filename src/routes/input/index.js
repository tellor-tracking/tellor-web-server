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
        ip: request.raw.req.headers['x-real-ip'] // since we are under reverse nginx proxy we save real ip in header
    }
}

function formatTrackObjectFactory(sdk, appId, appVersion, analytics, timestamp) {
    const additionalData = Object.assign({}, analytics, {timestamp, sdk, appVersion});
    return (eventData) => {
        // TODO validate eventData (or better do it client side)
        return Object.assign(eventData, {displayName: eventData.name}, {meta: additionalData}, {appId}); // TODO implement data merging from client side and server side
    }; // TODO add ability to specify event group

}

function getFormattedTrackObjects(requestQuery, extractedAnalytics, utcTimeStamp) {
    const {sdk, events, app_version, app_key} = requestQuery;
    const eventsArray = JSON.parse(events);

    return eventsArray.map(formatTrackObjectFactory(sdk, app_key, `${app_version}`, extractedAnalytics, utcTimeStamp));
}

// TODO add validation for data structure and request itself
const trackEvent = {
    method: 'GET',
    path: '/track',
    config: {auth: false},
    handler(request, reply) {
        reply();

        if (!areAllFieldsPresent(request.query)) {
            return console.error('Not all arguments defined');
        }

        const appKey = request.query.app_key;

        db.validateApplicationId(appKey)
            .then((isValid) => {
                if (!isValid) return console.error('Invalid app key');

                const trackEvents = getFormattedTrackObjects(request.query, getAnalyticsData(request), getUtcTimeStamp());
                db.insertTrackEvents(appKey, trackEvents);
            })
            .catch(err => {
                console.error('Track failed, due to error', err);
            })
    }
};

module.exports = [
    trackEvent
];
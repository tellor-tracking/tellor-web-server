
const isAllFieldsPresent = ({sdk, events, app_key, app_version}) => sdk && events && app_key && app_version;

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

module.exports = {
    getFormattedTrackObjects,
    isAllFieldsPresent
};
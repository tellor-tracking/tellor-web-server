const c = require('chance').Chance();
const moment = require('moment');

function getFakeEvents(numberOfEvents, numberOfDifferentEvents, days, appId, ips = [12345679], appVersion = [1]) {

    const timestamps = [];
    const d = moment();
    while (days--) {
        timestamps.push(d.clone().subtract(days, 'days').format());
    }

    const eventNames = c.unique(c.name, numberOfDifferentEvents);

    const segmentationKeysByName = eventNames.reduce((seg, name) => {
        seg[name] = c.unique(c.word, c.d6()).reduce((s, sk) => {
            s[sk] = c.unique(c.word, c.d4());
            return s;
        }, {});

        return seg;
    }, {});


    function getSegmentation(name) {
        return Object.keys(segmentationKeysByName[name]).reduce((finalObj, segKey) => {
            finalObj[segKey] = c.pickone(segmentationKeysByName[name][segKey]);
            return finalObj;
        }, {})

    }

    function makeEvent() {
        const name = c.pickone(eventNames);
        return {
            name: name,
            segmentation: getSegmentation(name),
            meta: {
                ip: c.pickone(ips),
                appVersion: c.pickone(appVersion),
                timestamp:  c.pickone(timestamps),
                sdk: 'web'
            },
            appId: appId
        }
    }

    return c.n(makeEvent, numberOfEvents);
}

function addFilters(db, appId, ipFilters = [], appFilters = []) {
    return Promise.all(ipFilters.map(f => db.addEventsFilter(appId, {filterValue: `ip=${f}`})))
        .then(() => Promise.all(appFilters.map(f => db.addEventsFilter(appId, {filterValue: `appVersion=${f}`}))))
}


module.exports = {
    getFakeEvents,
    addFilters
};

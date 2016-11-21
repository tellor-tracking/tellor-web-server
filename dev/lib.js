const c = require('chance').Chance();
const moment = require('moment');
const async = require('async');

function getFakeEvents(numberOfEvents, numberOfDifferentEvents, days, appId, ips = [12345679], appVersion = [187]) {

    let timestamps = [];
    const d = moment();

    if (Array.isArray(days)) {
        timestamps = days
    } else {
        while (days--) {
            timestamps.push(d.clone().subtract(days, 'days').format());
        }
    }

    const eventNames = Array.isArray(numberOfDifferentEvents) ? numberOfDifferentEvents : c.unique(c.name, numberOfDifferentEvents);

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
                timestamp: c.pickone(timestamps),
                sdk: 'web'
            },
            appId: appId
        }
    }

    return c.n(makeEvent, numberOfEvents);
}

function addFilters(db, appId, ipFilters = [], appFilters = [], ipOperator = '=', appVersionOperator = '=') {
    return new Promise((res, rej) => {
        const c = [
            ...ipFilters.map(f => (done) => {
                db.addEventsFilter(appId, {filterValue: `ip${ipOperator}${f}`}).then(() => done(null));
            }),
            ...appFilters.map(f => (done) => {
                db.addEventsFilter(appId, {filterValue: `appVersion${appVersionOperator}${f}`}).then(() => done(null));
            })
        ];

        async.series(c, res);
    })
}


module.exports = {
    getFakeEvents,
    addFilters
};

const c = require('chance').Chance();
const db = require('../src/db');
const moment = require('moment');

function getFakeEvents(numberOfEvents, numberOfDifferentEvents, days, appId) {

    const timestamps = [];
    const d = moment();
    while (days--) {
        timestamps.push(d.clone().subtract(days, 'days').format());
    }

    const eventNames = c.unique(c.name, numberOfDifferentEvents);

    const segementationKeysByName = eventNames.reduce((seg, name) => {
        seg[name] = c.unique(c.word, c.d6()).reduce((s, sk) => {
            s[sk] = c.unique(c.word, c.d4());
            return s;
        }, {});

        return seg;
    }, {});


    function getSegmentation(name) {
        return Object.keys(segementationKeysByName[name]).reduce((finalObj, segKey) => {
            finalObj[segKey] = c.pickone(segementationKeysByName[name][segKey]);
            return finalObj;
        }, {})

    }

    function makeEvent() {
        const name = c.pickone(eventNames);
        return {
            name: name,
            segmentation: getSegmentation(name),
            meta: {
                ip: c.ip(),
                appVersion: 1,
                timestamp:  c.pickone(timestamps),
                sdk: 'web'
            },
            appId: appId
        }
    }

    return c.n(makeEvent, numberOfEvents);
}

function clearAllCollections() {
    const d = db.getDb();

    d.collection('events').drop(()=> console.log('events dropped'));
    d.collection('eventsCounts').drop(()=> console.log('eventsCounts dropped'));
    d.collection('eventsFields').drop(()=> console.log('eventsFields dropped'));
    d.collection('applications').drop(()=> console.log('applications dropped'));

}

function createEventsForApplication(appName, name1, name2, name3) {

    db.connect(()=> {
        db.registerApplication(appName, appName, (err, {id})=> {
            db.insertTrackEvents(getFakeEvents(10000, 10, 30, id));
        });

        if (name1) {
            db.registerApplication(name1, name1, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id));
            });
        }

        if (name2) {
            db.registerApplication(name2, name2, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id));
            });
        }

        if (name3) {
            db.registerApplication(name3, name3, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id));
            });
        }
    });

}


let [,, action, name1, name2, name3] = process.argv;
if (action === 'add') {
    createEventsForApplication('TestOne', name1, name2, name3);
} else if (action === 'rm') {
    db.connect(clearAllCollections);
}
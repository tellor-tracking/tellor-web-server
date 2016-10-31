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
                ip: c.ip(),
                appVersion: c.pickone(['1', '2', '3a']),
                timestamp:  c.pickone(timestamps),
                sdk: 'web'
            },
            appId: appId
        }
    }

    return c.n(makeEvent, numberOfEvents);
}

function clearAllCollections(cb) {
    const d = db.getDb();

    d.collection('events').drop(()=> {
        console.log('events dropped');
        d.collection('eventsCounts').drop(()=> {
            console.log('eventsCounts dropped');
            d.collection('eventsFields').drop(()=> {
                console.log('eventsFields dropped');
                d.collection('applications').drop(()=> {
                    console.log('applications dropped');
                    d.collection('eventsIdentification').drop(()=> {
                        console.log('eventsIdentification dropped');
                        cb && cb();
                    });
                });
            });
        });
    });

}

function createEventsForApplication(appName, name1, name2, name3) {
console.log(appName, name1, name2, name3);
    db.connect(()=> {
        db.registerApplication(appName, appName, (err, {id})=> {
            db.addEventsFilter(id, {filterValue: 'ip=111.222.333'})
                .then(() => db.addEventsFilter(id, {filterValue: 'appVersion=1'}))
                .then(() => db.addEventsFilter(id, {filterValue: 'appVersion=2a'}))
                .then(() => db.addEventsFilter(id, {filterValue: 'appVersion=2b'}))
                .then(() => db.addEventsFilter(id, {filterValue: 'ip=1234.223.4.5'}))
                .then(() => db.insertTrackEvents(getFakeEvents(40000, 20, 60, id), id))
        });

        if (name1) {
            db.registerApplication(name1, name1, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id), id);
            });
        }

        if (name2) {
            db.registerApplication(name2, name2, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id), id);
            });
        }

        if (name3) {
            db.registerApplication(name3, name3, (err, {id})=> {
                db.insertTrackEvents(getFakeEvents(10000, 10, 30, id), id);
            });
        }
    });

}


let [,, action, name1, name2, name3] = process.argv;
if (action === 'add') {
    createEventsForApplication('TestOne', name1, name2, name3);
} else if (action === 'rm') {
    db.connect((c) => clearAllCollections(() => c.close()));
}

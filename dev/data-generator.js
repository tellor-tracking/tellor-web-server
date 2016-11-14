const c = require('chance').Chance();
const db = require('../src/db');
const {getFakeEvents, addFilters} = require('./lib');

const ips = [c.ip(), c.ip()];
const appVersions = ['1a', '2', '3'];


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
        db.registerApplication(appName, appName)
            .then(({id}) => {
                addFilters(db, id, ips, appVersions)
                    .then(() => db.insertTrackEvents(getFakeEvents(5000, 10, 30, id, ips, appVersions), id));
            });

        if (name1) {
            db.registerApplication(name1, name1)
                .then(({id})=> {
                    db.insertTrackEvents(getFakeEvents(10000, 10, 30, id, ips, appVersions), id);
                });
        }

        if (name2) {
            db.registerApplication(name2, name2)
                .then(({id})=> {
                    db.insertTrackEvents(getFakeEvents(10000, 10, 30, id, ips, appVersions), id);
                });
        }

        if (name3) {
            db.registerApplication(name3, name3)
                .then(({id})=> {
                    db.insertTrackEvents(getFakeEvents(10000, 10, 30, id, ips, appVersions), id);
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

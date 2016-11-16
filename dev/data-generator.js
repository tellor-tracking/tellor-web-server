const c = require('chance').Chance();
const db = require('../src/db');
const {getFakeEvents, addFilters} = require('./lib');

const ips = [c.ip(), c.ip()];
const appVersions = ['1a', '2', '3',54,4444.55555,666,7777,'sdfsdf22',55551,'5e7'];


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
    db.connect((c)=> {
        db.registerApplication(appName, appName)
            .then(({id}) => {
                addFilters(db, id, ips, appVersions)
                    .then(() => db.insertTrackEvents(id, getFakeEvents(2000, 10, 30, id, ips, appVersions)))
                    .then(() => c.close());
            })
    });

}


let [,, action, name1, name2, name3] = process.argv;
if (action === 'add') {
    createEventsForApplication('TestOne', name1, name2, name3);
} else if (action === 'rm') {
    db.connect((c) => clearAllCollections(() => c.close()));
}

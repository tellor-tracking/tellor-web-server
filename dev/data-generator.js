const c = require('chance').Chance();
const db = require('../src/db');
const {getFakeEvents, addFilters} = require('./lib');

const ips = [c.ip(), c.ip()];
const appVersions = ['1a', '2'];


function clearAllCollections(cb) {
    const d = db.getDb();

    d.collection('events').drop(()=> {
        console.log('events dropped');
        d.collection('eventsStats').drop(()=> {
            console.log('eventsStats dropped');
            d.collection('eventsFields').drop(()=> {
                console.log('eventsFields dropped');
                d.collection('applications').drop(()=> {
                    console.log('applications dropped');
                    cb && cb();
                });
            });
        });
    });
}



function createEventsForApplication(appName, name1, name2, name3) {
console.log(appName, name1, name2, name3);
    db.connect((c)=> {
        db.registerApplication(appName, appName)
            .then(({_id}) => {
                addFilters(db, _id, ips, appVersions)
                    .then(() => db.insertTrackEvents(_id, getFakeEvents(1000, 10, 30, _id, ips, appVersions)))
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

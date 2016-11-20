const md5 = require('md5');
const async = require('async');
const moment = require('moment');
const filtersCore =  require('../../core/filters');

function addGUIDs(appId, events) {
    for (let event of events) {
        event.id = md5(appId + event.name);
    }
}


function constructIncrementObject(segmentation, timeStamp) {
    const date = moment.utc(timeStamp).format('YYYY-MM-DD:HH');
    const obj = {[`count.${date}`]: 1};
    if (segmentation) {
        for (let key of Object.keys(segmentation)) {
            obj[`segmentation.${key}.${date}.${segmentation[key]}`] = 1
        }
    }

    return obj;
}


function incrementStats(events, db) {
    const collection = db.collection(`eventsStats-${moment.utc().format('YYYY-MM')}`);

    return new Promise((resolve, reject) => {
        async.series(events.map(event => done => collection.updateOne(
            {id: `${event.id}:filters:none`},
            {
                $inc: constructIncrementObject(event.segmentation, event.meta.timestamp),
                $setOnInsert: {appId: event.appId, name: event.name}
            },
            {upsert: true},
            done
        )), (err, res) => err ? reject(err) : resolve());
    });
}


function incrementStatsByEventsFilters(appId, events, db, dbObj) {

    dbObj.getFilters(appId, db)
        .then(filters => {
            const filtersCombinations = filtersCore.getAllFiltersCombinations(filters);

            filtersCombinations.forEach(combo => doFiltersIncremention(combo, events, db));
        })
        .catch(err => console.error('Failed to get filters', err));
}


function doFiltersIncremention(filters, events, db) {
    const collection = db.collection(`eventsStats-${moment.utc().format('YYYY-MM')}`);

    return new Promise((resolve, reject) => {
        async.series(events.map(event => done => {
            if (!filtersCore.doesEventPassFilters(event, filters)) {
                return done();
            }

            collection.updateOne(
                {id: `${event.id}:filters:${filters.map(f => f.id).join('-')}`},
                {
                    $inc: constructIncrementObject(event.segmentation, event.meta.timestamp),
                    $setOnInsert: {appId: event.appId, name: event.name}
                },
                {upsert: true},
                done
            )
        }), (err, res) => err ? reject(err) : resolve());
    })

}


function updateFieldsModel(events, db) {
    // Basically there are 2 different types of "keys" in our model
    // fixed type: always exist, this is data in "meta" object
    // fluid type: this is segmentation, these are different between events and can be different event between same name events

    const collection = db.collection('eventsFields');

    return new Promise((resolve, reject) => {
        async.series(events.map(event => done => collection.updateOne(
            {_id: event.id},
            {
                $addToSet: {segmentation: {$each: Object.keys(event.segmentation || {})}},
                $setOnInsert: {meta: ['ip', 'appVersion', 'timeStamp', 'sdk'], name: event.name, appId: event.appId}
            },
            {upsert: true}, done
        )), (err, res) => err ? reject(err) : resolve());
    });

}


const insertTrackEvents = (db, getDbObj) => (appId, events) => {
    const d = db();
    addGUIDs(appId, events);

    return d.collection(`events-${moment.utc().format('YYYY-MM')}`).insertMany(events)
        .then(() => Promise.all([
            updateFieldsModel(events, d),
            incrementStats(events, d),
            incrementStatsByEventsFilters(appId, events, d, getDbObj())
        ]))
        .then(() => console.log('Successfully inserted track events'))
        .catch(err => console.error(`Failed to insert events ${JSON.stringify(events)}`, err));
};


module.exports = {
    insertTrackEvents
};
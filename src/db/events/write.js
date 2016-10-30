const md5 = require('md5');

function addGUIDs(appId, events) {
    for (let event of events) {
        event.id = md5(appId + event.name);
    }
}


function constructIncrementObject(segmentation, timeStamp) {
    const date = timeStamp.split('T')[0];
    const obj = {[`count.${date}`]: 1};

    if (segmentation) {
        for (let key of Object.keys(segmentation)) {
            obj[`segmentation.${key}.${date}.${segmentation[key]}`] = 1
        }
    }

    return obj;
}


function incrementBasicCounts(events, db) {
    const collection = db.collection('eventsCounts');

    for (let event of events) {
        collection.updateOne(
            {name: event.name},
            {
                $inc: constructIncrementObject(event.segmentation, event.meta.timestamp),
                $setOnInsert: {id: event.id, appId: event.appId}
            },
            {upsert: true}
        )
    }
}

function updateFieldsModel(events, db) {
    // Basically there are 2 different types of "keys" in our model
    // fixed type: always exist, this is data in "meta" object
    // fluid type: this is segmentation, these are different between events and can be different event between same name events

    const collection = db.collection('eventsFields');

    for (let event of events) {
        collection.updateOne(
            {name: event.name},
            {
                $addToSet: {segmentation: {$each: Object.keys(event.segmentation || {})}}, // TODO maybe when segmentation chages, we should simply create new event version?
                $setOnInsert: {meta: ['ip', 'appVersion', 'timeStamp', 'sdk'], id: event.id, appId: event.appId}
            },
            {upsert: true}
        )
    }
}


// TODO make reference to event stuff by ID, not name
function insertTrackEvents(getDb) {
    return function(events, appId) {
        const db = getDb();
        addGUIDs(appId, events);

        db.collection('events').insertMany(events, (err, result) => {
            if (err) {
                console.error(`Failed to insert events ${JSON.stringify(events)}`, err);
            }

            console.log('Successfully inserted track events');

            updateFieldsModel(events, db);
            incrementBasicCounts(events, db);
        })
    }
}

module.exports = {
    insertTrackEvents
};
const md5 = require('md5');
const co = require('co');

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


function incrementStats(events, db) {
    const collection = db.collection(`eventsCounts`);

    for (let event of events) {
        collection.updateOne(
            {id: `${event.id}:filters:none`},
            {
                $inc: constructIncrementObject(event.segmentation, event.meta.timestamp),
                $setOnInsert: {appId: event.appId, name: event.name}
            },
            {upsert: true}
        )
    }
}

/* INCREMENT BY FILTERS */

function getFilters(appId, db) {
    // TODO this probably need to be at applications, need to make it easy to access db function from within db functions

    const collection = db.collection('applications');
    return collection.find({id: appId}).limit(1).next()
        .then(doc => doc ? doc.eventsFilters : [])
}

function getAllFiltersCombinations(filters) {

    const combinations = [];

    const filterByType = filters
        .reduce((types, filter) => {
            const type = filter.filterValue.split('=')[0]; // ip, appVersion, ...
            filter.type = type;
            if (types[type]) {
                types[type].push(filter);
            } else {
                types[type] = [filter];
            }
            return types;
        }, {});

    if (filterByType.ip) {
        filterByType.ip.forEach(ipFilter => {
            combinations.push([ipFilter]);

            if (filterByType.appVersion) {
                filterByType.appVersion.forEach(appVersionFilter => {
                    combinations.push([ipFilter, appVersionFilter]);
                });
            }
        })
    }

    if (filterByType.appVersion) {
        filterByType.appVersion.forEach(appVersionFilter => {
            combinations.push([appVersionFilter]);
        });
    }

    return combinations;
}

function incrementStatsByEventsFilters(appId, events, db) {

    getFilters(appId, db)
        .then(filters => {
            const filtersCombinations = getAllFiltersCombinations(filters);

            filtersCombinations.forEach(combo => incrementStatsByFilters(combo, events, db));
        })
        .catch(err => console.error('Failed to get filters', err));
}

function doesEventPassFilters(event, filters) {
    const isNegative = filterValue => filterValue.indexOf('=!') > -1;
    const getEqualityValues = (filterValue, isNegative) => filterValue.split(isNegative ? '=!' : '=')[1].split(','); // these values need to be escaped b4 this

    function checkIfMatchFilter(type, filterValue) {
        if (isNegative(filterValue)) {
            return getEqualityValues(filterValue, true).every(val => event.meta[type] !== val);
        } else {
            return getEqualityValues(filterValue, false).every(val => event.meta[type] === val);
        }
    }

    return filters.every(f => checkIfMatchFilter(f.type, f.filterValue));
}

function incrementStatsByFilters(filters, events, db) {
    const collection = db.collection(`eventsCounts`);

    for (let event of events) {
        if (!doesEventPassFilters(event, filters)) {
            continue;
        }

        collection.updateOne(
            {id: `${event.id}:filters:${filters.map(f => f.id).join('-')}`},
            {
                $inc: constructIncrementObject(event.segmentation, event.meta.timestamp),
                $setOnInsert: {appId: event.appId, name: event.name}
            },
            {upsert: true}
        )
    }
}

/* INCREMENT BY FILTERS - END */



function updateFieldsModel(events, db) {
    // Basically there are 2 different types of "keys" in our model
    // fixed type: always exist, this is data in "meta" object
    // fluid type: this is segmentation, these are different between events and can be different event between same name events

    const collection = db.collection('eventsFields');

    for (let event of events) {
        collection.updateOne(
            {id: event.id},
            {
                $addToSet: {segmentation: {$each: Object.keys(event.segmentation || {})}},
                $setOnInsert: {meta: ['ip', 'appVersion', 'timeStamp', 'sdk'], name: event.name, appId: event.appId}
            },
            {upsert: true}
        )
    }
}


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
            incrementStats(events, db);
            incrementStatsByEventsFilters(appId, events, db);
        })
    }
}

module.exports = {
    insertTrackEvents
};
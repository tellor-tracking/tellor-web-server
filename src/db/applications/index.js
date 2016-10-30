const uuid = require('shortid');
const co = require('co');

const isAppIdValid = db => (id, cb) => {
    const collection = db().collection('applications');
    collection.find({id: id}, {_id: 1}).limit(1).next((err, result) => cb(err, result !== null));
};

const authenticateApplication = db => co.wrap(function* (id, password) {
    const collection = db().collection('applications');
    const doc = yield collection.find({id: id}).limit(1).next();

    if (doc.password === password) {
        return true;
    } else {
        throw Error('Invalid password');
    } // TODO add hashing
});

const getApplications = db => (cb) => {
    const collection = db().collection('applications');
    collection.find({}, {password: 0}).toArray(cb);
};

const registerApplication = db => (name, password, cb) => {
    const collection = db().collection('applications');
    const id = uuid.generate();
    collection.insertOne({name: name, id: id, password: password || name, eventsFilters: []}, (err, result) => cb(err, {id: id}));
};

const removeApplication = db => co.wrap(function* (id) {
    // remove app and all of its events
    const appCol = db().collection('applications');
    const eventsCol = db().collection('events');
    const eventsCountsCol = db().collection('eventsCounts');
    const eventsFieldsCol = db().collection('eventsFields');

    const result = yield [
         appCol.deleteOne({id}),
         eventsCol.deleteMany({appId: id}),
         eventsCountsCol.deleteOne({appId: id}),
         eventsFieldsCol.deleteMany({appId: id})
    ];
    result.some((r)=> console.log(r.deletedCount));
    if (result.some((r)=> r.deletedCount === 0)) {
        throw Error(`Failed to delete ${id}`);
    }
});

const updateEventsFilter = db => (appId, {filterValue, filterId = null}) => {
    // TODO add validation, removal...
    const collection = db().collection('applications');
    if (filterId) {
        // FIXME updating is actually not possible, what should happen is we create new entry and delete everything with old one
        // so user should not be able to update it, but rather to delete and add new one
        return collection.updateOne({id: appId, 'eventsFilters.id': filterId}, {$set: {'eventsFilters.$.filterValue': filterValue}});
    } else {
        return collection.updateOne({id: appId}, {$addToSet: {'eventsFilters': {filterValue, id: uuid.generate()}}}, {upsert: true});
    }
};


module.exports = {
    registerApplication,
    removeApplication,
    isAppIdValid,
    getApplications,
    authenticateApplication,
    updateEventsFilter
};

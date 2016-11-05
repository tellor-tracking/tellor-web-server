const uuid = require('shortid');
const co = require('co');

const isAppIdValid = db => (id) => {
    const collection = db().collection('applications');
    return collection.find({id: id}, {_id: 1}).limit(1).next().then((result) => result !== null);
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

const getApplications = db => () => {
    const collection = db().collection('applications');
    return collection.find({}, {password: 0}).toArray();
};

const registerApplication = db => (name, password, cb) => {
    const collection = db().collection('applications');
    const id = uuid.generate();
    return collection.insertOne({name: name, id: id, password: password || name, eventsFilters: []}).then(() => ({id}));
};

const removeApplication = db => co.wrap(function* (id) {
    // remove app and all of its events
    const appCol = db().collection('applications');
    const eventsCol = db().collection('events');
    const eventsCountsCol = db().collection('eventsCounts');
    const eventsFieldsCol = db().collection('eventsFields');

    yield [
         appCol.deleteOne({id}),
         eventsCol.deleteMany({appId: id}),
         eventsCountsCol.deleteOne({appId: id}),
         eventsFieldsCol.deleteMany({appId: id})
    ];

    // its possible to delete when 0 events were pushed, so it would delete count 0
/*    if (result.some((r)=> r.deletedCount === 0)) {
        throw Error(`Failed to delete ${id}`);
    }*/
});

const addEventsFilter = db => (appId, {filterValue, filterId = null}) => {
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

const deleteEventsFilter = db => (appId, filterId) => {
    const collection = db().collection('applications');
    return collection.updateOne({id: appId}, {$pull: {eventsFilters: {id: filterId}}});
    // TODO delete all stats aswell
};


module.exports = {
    registerApplication,
    removeApplication,
    isAppIdValid,
    getApplications,
    authenticateApplication,
    addEventsFilter,
    deleteEventsFilter
};

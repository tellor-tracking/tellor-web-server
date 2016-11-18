const uuid = require('shortid');
const co = require('co');

const isAppIdValid = db => (id) => {
    const collection = db().collection('applications');
    return collection.find({id: id}, {_id: 1}).limit(1).next().then((result) => result !== null);
};

const isFilterIdValid = db => (appId, filterId) => {
    const collection = db().collection('applications');
    return collection.find({id: appId}, {eventsFilters: 1}).limit(1).next().then((result) => result.eventsFilters.find(f => f.id === filterId) !== undefined);
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

const getApplication = db => (id) => {
    const collection = db().collection('applications');
    return collection.find({id}, {password: 0}).limit(1).next();
};

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
    const eventsStatsCol = db().collection('eventsStats');
    const eventsFieldsCol = db().collection('eventsFields');

    yield [
         appCol.deleteOne({id}),
         eventsCol.deleteMany({appId: id}),
         eventsStatsCol.deleteOne({appId: id}),
         eventsFieldsCol.deleteMany({appId: id})
    ];

    // its possible to delete when 0 events were pushed, so it would delete count 0
/*    if (result.some((r)=> r.deletedCount === 0)) {
        throw Error(`Failed to delete ${id}`);
    }*/
});

function isFilterValueValid(value) {
    const [key, val, ...rest] = value.split('=');
    if (key === undefined || val === undefined || rest.length !== 0) {
        return false;
    }

    if (['ip', 'appVersion'].indexOf(key) === -1) {
        return false;
    }

    return true

}

const addEventsFilter = db => (appId, {filterValue}) => {
    if (!isFilterValueValid(filterValue)) {
        return Promise.reject('Invalid filterValue');
    }

    const collection = db().collection('applications');
    const id = uuid.generate();

    return collection.updateOne({id: appId}, {
        $addToSet: {
            'eventsFilters': {
                filterValue,
                id
            }
        }
    }, {upsert: true}).then((res) => ({res, id}));
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
    getApplication,
    getApplications,
    authenticateApplication,
    addEventsFilter,
    deleteEventsFilter,
    isFilterIdValid
};

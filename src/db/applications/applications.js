const uuid = require('shortid');

const isAppIdValid = db => (id) => {
    const collection = db().collection('applications');
    return collection.find({id: id}, {_id: 1}).limit(1).next().then((result) => result !== null);
};

const authenticateApplication = db => function (id, password) {
    const collection = db().collection('applications');
    return collection.find({id: id}).limit(1).next()
        .then(doc => {
            if (doc.password === password) {
                return true;
            } else {
                throw Error('Invalid password');
            } // TODO add hashing
        })


};

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

const removeApplication = db => function (id) {
    // remove app and all of its events
    const appCol = db().collection('applications');
    const eventsCol = db().collection('events'); // TODO get all collections by date
    const eventsStatsCol = db().collection('eventsStats'); // TODO get all collections by date
    const eventsFieldsCol = db().collection('eventsFields');

    return Promise.all([
        appCol.deleteOne({id}),
        eventsCol.deleteMany({appId: id}),
        eventsStatsCol.deleteOne({appId: id}),
        eventsFieldsCol.deleteMany({appId: id})
    ]);

    // its possible to delete when 0 events were pushed, so it would delete count 0
    /*    if (result.some((r)=> r.deletedCount === 0)) {
     throw Error(`Failed to delete ${id}`);
     }*/
};


module.exports = {
    registerApplication,
    removeApplication,
    isAppIdValid,
    getApplication,
    getApplications,
    authenticateApplication,
};

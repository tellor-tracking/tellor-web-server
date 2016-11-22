const uuid = require('shortid');
const {BadDataError} = require('../../lib/apiErrorHandler');
const utils = require('../utils');
const bcrypt = require('bcryptjs');

const validateApplicationId = db => _id => {
    const collection = db().collection('applications');
    return collection.find({_id}, {_id: 1}).limit(1).next().then((result) => {
        if (result === null) {
            throw new BadDataError('Invalid app id');
        }

        return true;
    });
};

const authenticateApplication = db => (_id, password) => {
    const collection = db().collection('applications');
    return collection.find({_id}).limit(1).next()
        .then(doc => {
            if (!doc) {
                throw new BadDataError('Invalid app id');
            } else if (bcrypt.compareSync(password, doc.password)) {
                return true;
            } else {
                throw new BadDataError('Invalid app password');
            }
        })
};

const getApplication = db => _id => {
    const collection = db().collection('applications');
    return collection.find({_id}, {password: 0}).limit(1).next();
};

const getApplications = db => () => {
    const collection = db().collection('applications');
    return collection.find({}, {password: 0}).toArray();
};

const registerApplication = db => (name, password) => {
    const collection = db().collection('applications');
    const _id = uuid.generate();
    return collection.insertOne({name: name, _id, password: bcrypt.hashSync(password || name, 8), eventsFilters: []}).then(() => ({_id}));
};

const removeApplication = db => _id =>{
    // remove app and all of its events
    const appCol = db().collection('applications');
    const eventsFieldsCol = db().collection('eventsFields');

    return Promise.all([
        utils.getRelevantCollectionsByName(db(), 'events'),
        utils.getRelevantCollectionsByName(db(), 'eventsStats')
    ])
        .then(([eventsCols, eventsStatsCols]) => Promise.all([
            appCol.deleteOne({_id}),
            Promise.all(eventsCols.map(col => col.deleteMany({appId: _id}))),
            Promise.all(eventsStatsCols.map(col => col.deleteMany({appId: _id}))),
            eventsFieldsCol.deleteMany({appId: _id})
        ]));


    // its possible to delete when 0 events were pushed, so it would delete count 0
    /*    if (result.some((r)=> r.deletedCount === 0)) {
     throw Error(`Failed to delete ${id}`);
     }*/
};


module.exports = {
    registerApplication,
    removeApplication,
    validateApplicationId,
    getApplication,
    getApplications,
    authenticateApplication,
};

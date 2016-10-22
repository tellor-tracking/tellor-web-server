const uuid = require('shortid');

const isAppIdValid = db => (id, cb) => {
    const collection = db().collection('applications');
    collection.find({id: id}, {_id: 1}).limit(1).next((err, result) => cb(err, result !== null));
};

const registerApplication = db => (name, cb) => {
    const collection = db().collection('applications');
    const id = uuid.generate();
    collection.insertOne({name: name, id: id}, (err, result) => cb(err, {id: id}));

};

const removeApplication = db => (name, cb) => {
    const collection = db().collection('applications');
    // remove app and all of its events
};


module.exports = {
    registerApplication,
    removeApplication,
    isAppIdValid
};

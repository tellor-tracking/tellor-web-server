const uuid = require('node-uuid');

const registerApplication = db => (name, cb) => {
    const collection = db().collection('applications');
    const id = uuid.v1();
    collection.insertOne({name: name, id: id}, (err, result) => cb(err, {id: id}));

};

const removeApplication = db => (name, cb) => {
    const collection = db().collection('applications');
    // remove app and all of its events
};


module.exports = {
    registerApplication,
    removeApplication
};

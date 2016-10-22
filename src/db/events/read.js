function getEvents(db) {
    return function(appId, cb) {

        const collection = db().collection('eventsFields');

        collection.find({appId}).toArray(cb);
    }
}

module.exports = {
    getEvents
};
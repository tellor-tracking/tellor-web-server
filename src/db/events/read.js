function getEvents(db) {
    return function(cb) {

        const collection = db().collection('eventsFields');

        collection.find({}).toArray(cb);
    }
}

module.exports = {
    getEvents
};
function getEventsWrap(db) {
    return function getEvents(cb) {

        const collection = db.db.collection('eventsFields');

        collection.find({}).toArray(cb);
    }
}

module.exports = {
    getEventsWrap
};
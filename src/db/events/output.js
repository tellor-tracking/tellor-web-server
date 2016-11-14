function getEvents(db) {
    return function(appId) {

        const collection = db().collection('eventsFields');

        return collection.find({appId}).toArray();
    }
}

module.exports = {
    getEvents
};
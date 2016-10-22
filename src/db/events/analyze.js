function getEventCounts(db) {
    return function(eventId, cb) {

        const collection = db().collection('eventsCounts');
        collection.findOne({id: eventId}, cb);
    }
}

function getAllEventsCount(db) {
    return function(cb) {

        const collection = db().collection('eventsCounts');
        collection.find({}).toArray((err, docs) => {
            if (err) {
                return cb(err);
            }

            cb(err, docs); // TODO return only count for like 30 days or something
        });
    }
}

module.exports = {
    getEventCounts,
    getAllEventsCount
};
function getEventCountsWrap(db) {
    return function getEventCounts(eventId, cb) {

        const collection = db.db.collection('eventsCounts');
        collection.findOne({id: eventId}, cb);
    }
}

function getAllEventsCountWrap(db) {
    return function getAllEventsCount(cb) {

        const collection = db.db.collection('eventsCounts');
        collection.find({}).toArray((err, docs) => {
            if (err) {
                return cb(err);
            }

            cb(err, docs); // TODO return only count for like 30 days or something
        });
    }
}

module.exports = {
    getEventCountsWrap,
    getAllEventsCountWrap
};
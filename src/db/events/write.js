module.exports = function insertWrap(db) {
    return function insertTrackEvents(events, cb) {

        const collection = db.db.collection('events');

        collection.insertMany(events, (err, result) => {
            if (err) {
                console.error(`Failed to insert events ${JSON.stringify(events)}`, err);
            }

            console.log('Successfully inserted track events');
            cb && cb(err, result);
        })
    }
};
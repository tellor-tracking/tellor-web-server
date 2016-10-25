function getEventCounts(db) {
    return function(eventId, cb) {

        const collection = db().collection('eventsCounts');
        collection.findOne({id: eventId}, cb);
    }
}

function getAllEventsCount(db) {
    function formatForSingleKey(key, obj) {
        return Object.keys(obj[key]).map(k => ({date: k, count: obj[key][k], name: key}));
    }

    function formatDataForClient(docs) {
        for (let doc of docs) {
            doc.count = formatForSingleKey('count', doc);
            for (let segKey in doc.segmentation) {
                let segKeyValueKeysValues = [];
                for (let segValueKey in doc.segmentation[segKey]) {
                    segKeyValueKeysValues = segKeyValueKeysValues.concat(formatForSingleKey(segValueKey, doc.segmentation[segKey]));
                }
                doc.segmentation[segKey] = segKeyValueKeysValues;
            }
        }

        return docs;
    }

    return function(appId, cb) {

        const collection = db().collection('eventsCounts');
        collection.find({appId}).toArray((err, docs) => {
            if (err) {
                return cb(err);
            }
            cb(err, formatDataForClient(docs)); // TODO return only count for like 30 days or something
        });
    }
}

module.exports = {
    getEventCounts,
    getAllEventsCount
};
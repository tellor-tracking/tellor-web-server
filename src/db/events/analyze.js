const moment = require('moment');

function getEventCounts(db) {
    return function(eventId, cb) {

        const collection = db().collection('eventsCounts');
        collection.findOne({id: eventId}, cb);
    }
}

function getAllEventsCount(db) {

    function formatForSingleKey(key, obj, isDateInRange) {
        return Object.keys(obj[key]).reduce((result, k) => {
            if (isDateInRange(k)) {
                result.push({date: k, count: obj[key][k], name: key});
            }

            return result;
        }, []);
    }

    function formatDataForClient(docs, isDateInRange) {

        for (let doc of docs) {
            doc.count = formatForSingleKey('count', doc, isDateInRange);
            for (let segKey in doc.segmentation) {
                let segKeyValueKeysValues = [];
                for (let segValueKey in doc.segmentation[segKey]) {
                    segKeyValueKeysValues = segKeyValueKeysValues.concat(formatForSingleKey(segValueKey, doc.segmentation[segKey], isDateInRange));
                }
                doc.segmentation[segKey] = segKeyValueKeysValues;
            }
        }

        return docs;
    }

    function reduceDateRangeFactory({startDate = null, endDate = null}) {
        const s = moment(startDate).subtract(1, 'hour');
        const e = moment(startDate).add(1, 'hour');
        if (startDate && endDate) {
            return (d) => moment(d).isBetween(s, e);
        } else if (startDate) {
            return (d) => moment(d).isAfter(s);
        } else if (endDate) {
            return (d) => moment(d).isBefore(e);
        } else {
            return () => true;
        }
    }

    return function({appId, startDate, endDate}, cb) {

        const collection = db().collection('eventsCounts');
        collection.find({appId}).toArray((err, docs) => {
            if (err) {
                return cb(err);
            }
            cb(err, formatDataForClient(docs, reduceDateRangeFactory({startDate, endDate}))); // TODO return only count for like 30 days or something
        });
    }
}

module.exports = {
    getEventCounts,
    getAllEventsCount
};
const moment = require('moment');

/* FORMATTING & FILTERING */

function formatForSingleKey(key, obj, isDateInRange) {
    return Object.keys(obj[key]).reduce((result, k) => {
        if (isDateInRange(k)) {
            result.push({date: k, count: obj[key][k], name: key});
        }

        return result;
    }, []);
}

function formatAllEventsForClient (docs, isDateInRange) {
    for (let doc of docs) {
        formatEventForClient(doc, isDateInRange)
    }
    return docs;
}

function formatEventForClient(doc, isDateInRange) {

    doc.count = formatForSingleKey('count', doc, isDateInRange);
    for (let segKey in doc.segmentation) {
        let segKeyValueKeysValues = [];
        for (let segValueKey in doc.segmentation[segKey]) {
            segKeyValueKeysValues = segKeyValueKeysValues.concat(formatForSingleKey(segValueKey, doc.segmentation[segKey], isDateInRange));
        }
        doc.segmentation[segKey] = segKeyValueKeysValues;
    }

    return doc;
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

/* FORMATTING & FILTERING - END */


function getEventCounts(db) {
    return function({eventId, startDate, endDate}, cb) {

        const collection = db().collection('eventsCounts');
        collection.findOne({id: eventId}, (err, doc) => {
            if (err) {
                return cb(err);
            }
            cb(err, formatEventForClient(doc, reduceDateRangeFactory({startDate, endDate})));
        });
    }
}

function getAllEventsCount(db) {

    return function({appId, startDate, endDate}, cb) {

        const collection = db().collection('eventsCounts');
        collection.find({appId}).toArray((err, docs) => {
            if (err) {
                return cb(err);
            }
            cb(err, formatDataForClient(docs, formatAllEventsForClient({startDate, endDate}))); // TODO return only count for like 30 days or something
        });
    }
}

module.exports = {
    getEventCounts,
    getAllEventsCount
};
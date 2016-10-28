const moment = require('moment');

/* FORMATTING & FILTERING */

function formatForSingleKey(key, obj, isDateInRange) {
    return Object.keys(obj[key]).reduce((result, k) => {
        if (isDateInRange(k)) {
            result.byDate.push({date: k, [key]: obj[key][k]});
            result.total += obj[key][k];
        }

        return result;
    }, {byDate: [], total: 0});
}

function formatForSegmentation(date, obj) {
    const valuesBySegKeys =  Object.keys(obj).reduce((result, segKeyValueKey) => {
        result[segKeyValueKey] = obj[segKeyValueKey];
        return result;
    }, {});

    valuesBySegKeys.date = date;
    return valuesBySegKeys;
}

function formatAllEventsForClient (docs, isDateInRange) {
    for (let doc of docs) {
        formatEventForClient(doc, isDateInRange)
    }
    return docs;
}

function formatEventForClient(doc, isDateInRange) {

    const {byDate, total} = formatForSingleKey('count', doc, isDateInRange);
    doc.count = byDate;
    doc.totalCount = total;

    for (let segKey in doc.segmentation) {
        let segKeyValueKeysValues = [];

        for (let date in doc.segmentation[segKey]) {
            if (!isDateInRange(date)) continue;

            segKeyValueKeysValues.push(formatForSegmentation(date, doc.segmentation[segKey][date]));
        }
        doc.segmentation[segKey] = segKeyValueKeysValues;
    }

    return doc;
}

function reduceDateRangeFactory({startDate = null, endDate = null}) {
    const s = moment(startDate).subtract(1, 'hours');
    const e = moment(endDate).add(1, 'hours');
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

module.exports = {
    getEventCounts
};
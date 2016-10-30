const moment = require('moment');
const set = require('lodash/set');

/* FORMATTING & FILTERING */

function orderByDate(listOfCounts) {
    return listOfCounts.sort((c1, c2) => moment(c1.date).isBefore(c2.date) ? -1 : 1)
}

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

function formatEventForClient(doc, isDateInRange) {

    const {byDate, total} = formatForSingleKey('count', doc, isDateInRange);
    doc.count = orderByDate(byDate);
    doc.totalCount = total;

    for (let segKey in doc.segmentation) {
        let segKeyValueKeysValues = [];

        for (let date in doc.segmentation[segKey]) {
            if (!isDateInRange(date)) continue;

            segKeyValueKeysValues.push(formatForSegmentation(date, doc.segmentation[segKey][date]));
        }
        doc.segmentation[segKey] = orderByDate(segKeyValueKeysValues);
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

/* QUERY FORMATTING */

function formatFilterByQuery(query) {
    const finalFilterObj = {};
    if (query.startDate) {
        finalFilterObj['meta.timestamp'] = {
            $gte: query.startDate
        };
    }

    if (query.endDate) {
        if (finalFilterObj['meta.timestamp']) {
            finalFilterObj['meta.timestamp'].$lte = query.endDate;
        }
    }

    if (query.ip) {
        if (query.ip.indexOf('!') > -1) {
            finalFilterObj['meta.ip'] = {
                $ne: query.ip.slice(1)
            }
        } else {
            finalFilterObj['meta.ip'] = {
                $eq: query.ip
            }
        }
    }

    if (query.appVersion) {
        if (query.appVersion.indexOf('!') > -1) {
            finalFilterObj['meta.appVersion'] = {
                $ne: query.appVersion.slice(1)
            }
        } else {
            finalFilterObj['meta.appVersion'] = {
                $eq: query.appVersion
            }
        }
    }

    return Object.keys(finalFilterObj).length > 0 ? finalFilterObj : null;
}

/* QUERY FORMATTING - END */


function getEventCounts(db) {
    return function({eventId, startDate, endDate}, cb) {

        const collection = db().collection('eventsCounts');
        collection.findOne({id: `${eventId}:filters:none`}, (err, doc) => {
            if (err) {
                return cb(err);
            }
            cb(err, formatEventForClient(doc, reduceDateRangeFactory({startDate, endDate})));
        });
    }
}

function getEventCountsByFilters(db) {
    return function({eventId, query}, cb) {
        const collection = db().collection('events');

        let match = {id: eventId};

        const filterQuery = formatFilterByQuery(query);

        if (filterQuery) {
            match = Object.assign({}, match, filterQuery)
        }

        collection.aggregate([
            {$match: match},
            {$group: {_id: {segmentation: '$segmentation', timestamp: '$meta.timestamp'} }}
        ], (err, result) => {
            if (err) {
                console.error(err);
            }

            cb(err, result);
        })
    }
}

module.exports = {
    getEventCounts,
    getEventCountsByFilters
};
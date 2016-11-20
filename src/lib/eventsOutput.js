const moment = require('moment');

/* FORMATTING & FILTERING */

const incrementObjKeys = (targetObj, valuesObj) => Object.keys(valuesObj).forEach(k => targetObj[k] += valuesObj[k]);

/**
 * Events stats by default are counted hourly. This methods aggregates it to daily or monthly
 * @param rangeStep hour, day or month
 * @param {object} obj object with format {[date]: number}
 */
function reduceToDateRange(rangeStep, obj) {
    if (rangeStep === 'hour') {
        return obj;
    } else {
        return Object.keys(obj).reduce((result, date) => {
            const newDate = moment.utc(date.split(':')[0]).format(rangeStep === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM');
            if (result[newDate]) {
                if (isNaN(obj[date])) { // if it's segmentation it has as a value obj: {segValueKey: 1, anotherSegValueKey: 2}
                    incrementObjKeys(result[newDate], obj[date]);
                } else {
                    result[newDate] += obj[date];
                }
            } else {
                result[newDate] = obj[date];
            }

            return result;
        }, {})
    }
}

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

function getDateFilter({startDate = null, endDate = null}) {
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

/**
 * Formats eventsStats into a slightly different structure which
 * suits client side needs. Also filters events to more precise date
 * and aggregates them to certain interval (step).
 * @param {object} doc
 * @param {string} step
 * @param {object} dateRange
 * @return {object}
 */
function formatEventsForClient(doc, step, dateRange) {
    const isDateInRange = getDateFilter(dateRange);

    const {byDate, total} = formatForSingleKey('count', {count: reduceToDateRange(step, doc.count)}, isDateInRange);
    doc.count = orderByDate(byDate);
    doc.totalCount = total;

    for (let segKey in doc.segmentation) {
        let segKeyValueKeysValues = [];

        const aggregatedByDate = reduceToDateRange(step, doc.segmentation[segKey]);

        for (let date in aggregatedByDate) {
            if (!isDateInRange(date)) continue;

            segKeyValueKeysValues.push(formatForSegmentation(date, aggregatedByDate[date]));
        }
        doc.segmentation[segKey] = orderByDate(segKeyValueKeysValues);
    }

    return doc;
}


/* FORMATTING & FILTERING - END */

module.exports = {
    formatEventsForClient
};
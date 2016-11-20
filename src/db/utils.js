const moment = require('moment');

function getRangeOfDates(startDate, endDate, step = 'months') {
    const format = step === 'months' ? 'YYYY-MM' : 'YYYY-MM-DD';
    const s = moment(startDate);
    const e = moment(endDate);
    const dates = [];

    for (;s.isBefore(e, step) || s.isSame(e, step); s.add(1, step)) {
        dates.push(s.clone().format(format));
    }

    return dates;
}

/**
 * Find collections in given date range which have a date postfix to their name
 * @param db
 * @param collectionName
 * @param startDate
 * @param endDate
 * @param step
 * @return {Promise.<TResult>}
 */
function getRelevantCollections(db,
                                collectionName,
                                startDate = moment.utc().subtract(1, 'months').format('YYYY-MM-DD'),
                                endDate = moment.utc().format('YYYY-MM-DD'),
                                step = 'months') {

    const namesToMatch = getRangeOfDates(startDate, endDate, step).map(d => `${collectionName}-${d}`);

    return db.collections()
        .then(collections => {
            return collections.filter(c => namesToMatch.find(n => n === c.s.name))
        });

}


module.exports = {
    getRelevantCollections
};
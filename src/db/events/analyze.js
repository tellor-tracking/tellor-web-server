const moment = require('moment');
const set = require('lodash/set');
const utils = require('../utils');
const deepmerge = require('deepmerge');
const {formatEventsForClient} = require('../../lib/eventsOutput');


function getEventStats(db) {
    return function(eventId, {startDate, endDate, filters, step = 'day'} = {}) {

        const filtersQuery = filters ? filters.replace(',', '-') : 'none';

        return utils.getRelevantCollections(db(), 'eventsStats', startDate, endDate)
            .then(collections => Promise.all(collections.map(c => c.findOne({id: `${eventId}:filters:${filtersQuery}`}))))
            .then(objects => objects.length > 1 ? deepmerge.all(objects) : objects[0])
            .then((doc => {

                if (doc) {
                    return formatEventsForClient(doc, step, {startDate, endDate});
                }

                return {
                    totalCount: 0,
                    count: [],
                    segmentation: {}
                };
                // TODO fix me when no data for event
            }))
    }
}

module.exports = {
    getEventStats
};
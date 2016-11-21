const uuid = require('shortid');
const filtersLib = require('../../lib/filters');
const {BadDataError} = require('../../lib/apiErrorHandler');

const validateFilterId = db => (appId, filterId) => {
    const collection = db().collection('applications');
    return collection.find({_id: appId}, {eventsFilters: 1}).limit(1).next()
        .then((result) => {
            if (result.eventsFilters.find(f => f.id === filterId) === undefined) {
                throw new BadDataError('Invalid filter id');
            }
        });
};

const addEventsFilter = db => (appId, {filterValue}) => {
    if (!filtersLib.isFilterValueValid(filterValue)) {
        throw new BadDataError('Invalid filterValue');
    }

    const collection = db().collection('applications');
    const id = uuid.generate();

    return collection.updateOne({_id: appId}, {
        $addToSet: {
            'eventsFilters': {
                filterValue,
                id
            }
        }
    }, {upsert: true}).then((res) => ({res, id}));
};

const deleteEventsFilter = db => (appId, filterId) => {
    const collection = db().collection('applications');
    return collection.updateOne({_id: appId}, {$pull: {eventsFilters: {id: filterId}}});
    // TODO delete all stats aswell
};

const getFilters = db => appId => {
    const collection = db().collection('applications');
    return collection.find({_id: appId}).limit(1).next()
        .then(doc => doc ? doc.eventsFilters : [])
};

module.exports = {
    addEventsFilter,
    deleteEventsFilter,
    validateFilterId,
    getFilters
};

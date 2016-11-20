const uuid = require('shortid');

const isFilterIdValid = db => (appId, filterId) => {
    const collection = db().collection('applications');
    return collection.find({id: appId}, {eventsFilters: 1}).limit(1).next()
        .then((result) => result.eventsFilters.find(f => f.id === filterId) !== undefined);
};


function isFilterValueValid(value) {
    const [key, val, ...rest] = value.split('=');
    if (key === undefined || val === undefined || rest.length !== 0) {
        return false;
    }

    if (['ip', 'appVersion'].indexOf(key) === -1) {
        return false;
    }

    return true

}

const addEventsFilter = db => (appId, {filterValue}) => {
    if (!isFilterValueValid(filterValue)) {
        return Promise.reject('Invalid filterValue');
    }

    const collection = db().collection('applications');
    const id = uuid.generate();

    return collection.updateOne({id: appId}, {
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
    return collection.updateOne({id: appId}, {$pull: {eventsFilters: {id: filterId}}});
    // TODO delete all stats aswell
};

const getFilters = db => appId => {
    const collection = db().collection('applications');
    return collection.find({id: appId}).limit(1).next()
        .then(doc => doc ? doc.eventsFilters : [])
};

module.exports = {
    addEventsFilter,
    deleteEventsFilter,
    isFilterIdValid,
    getFilters
};

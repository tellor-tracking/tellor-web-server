
function getAllFiltersCombinations(filters) {
    const combinations = [];

    const filterByType = filters
        .reduce((types, filter) => {
            const type = filter.filterValue.split('=')[0]; // ip, appVersion, ...
            filter.type = type;
            if (types[type]) {
                types[type].push(filter);
            } else {
                types[type] = [filter];
            }
            return types;
        }, {});

    if (filterByType.ip) {
        filterByType.ip.forEach(ipFilter => {
            combinations.push([ipFilter]);

            if (filterByType.appVersion) {
                filterByType.appVersion.forEach(appVersionFilter => {
                    combinations.push([ipFilter, appVersionFilter]);
                });
            }
        })
    }

    if (filterByType.appVersion) {
        filterByType.appVersion.forEach(appVersionFilter => {
            combinations.push([appVersionFilter]);
        });
    }

    return combinations;
}


function doesEventPassFilters(event, filters) {
    const isNegative = filterValue => filterValue.indexOf('=!') > -1;
    const getEqualityValues = (filterValue, isNegative) => filterValue.split(isNegative ? '=!' : '=')[1].split(','); // these values need to be escaped b4 this

    function checkIfMatchFilter(type, filterValue) {
        if (isNegative(filterValue)) {
            return getEqualityValues(filterValue, true).every(val => event.meta[type] !== val);
        } else {
            return getEqualityValues(filterValue, false).some(val => event.meta[type] === val);
        }
    }

    return filters.every(f => checkIfMatchFilter(f.type, f.filterValue));
}


function isFilterValueValid(value) {
    const [key, val, ...rest] = value.split('=');
    if (key === undefined || val === undefined || rest.length !== 0) {
        return false;
    }

    if (['ip', 'appVersion'].indexOf(key) === -1) {
        return false;
    }

    return true;
}

module.exports = {
    getAllFiltersCombinations,
    doesEventPassFilters,
    isFilterValueValid
};
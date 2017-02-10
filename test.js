const moment = require('moment');
const deepmerge = require('deepmerge');


function getRangeOfDates(startDate, endDate, step = 'months', format = 'YYYY-MM-DD') {
    const s = moment(startDate);
    const e = moment(endDate);
    const dates = [];


    for (;s.isBefore(e); s.add(1, step)) {
        dates.push(s.clone().format(format));
    }

    return dates;

}

const t = {
    segmentation: {
        'alah': {
            '20014': 3
        },
        'llol': {
            '200144': 5
        }
    }
};

const t2 = {
    segmentation: {
        'nope': {
            '20015': 1
        },
        'llol': {
            '200146': 10
        }
    }
};

const t3 = {
    segmentation: {
        'nope': {
            '20015': 1,
            '20019': 1
        },
        'llol': {
            '200147': 1
        }
    }
};

console.log(deepmerge.all([t, t2, t3]));
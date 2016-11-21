const winston = require('winston');
const config = require('../config');


// levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

const log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: 'debug', colorize: true}),
        new (winston.transports.File)({
            level: 'info',
            filename: config.logs.logsFile,
            maxsize: config.logs.maxLogSize,
            maxFiles: config.logs.maxNumberOfLogsFiles,
            tailable: true,
            humanReadableUnhandledException: true
        }),
    ]
});

if (process.env.NODE_ENV === 'test') {
    log.transports.console.level = 'warn';
    log.remove(winston.transports.File);
}


module.exports = log;
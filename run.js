const pm2 = require('pm2');

pm2.connect(err => {
    if (err) {
        console.log(err);
        process.exit(2);
    }

    console.log('Starting server');
    pm2.start({
        script: __dirname + '/index.js',
        name: 'tellor',
        max_memory_restart: '6000M',
        // output: '/var/log/tellor/tellor.pm2.log',
        // error: '/var/log/tellor/tellor.pm2.error.log'
    }, err => {
        pm2.disconnect();
        if (err) throw err;
    })
});
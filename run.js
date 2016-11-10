const pm2 = require('pm2');

pm2.connect(false, err => {
    if (err) {
        console.log(err);
        process.exit(2);
    }

    pm2.start({
        script: 'index.js',
        name: 'tellor',
        max_memory_restart: '6000M',
        output: '/var/logs/tellor.pm2.logs',
        error: '/var/logs/tellor.pm2.error.logs'
    }, err => {
        pm2.disconnect();
        if (err) throw err;
    })
});
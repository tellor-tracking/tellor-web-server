module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [

        // First application
        {
            name: 'tellor',
            script: __dirname + '/index.js',
            max_memory_restart: '6000M',
            exec_mode: 'cluster',
            instances: 2,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};

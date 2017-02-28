module.exports = pkg => ({
    env: {
        redisHost: {
            description: 'the Redis host',
            default: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        namespace: {
            description: 'the Redis key namespace',
            default: pkg.lastName
        },
        refileDomain: {
            description: 'the Refile domain',
            default: 'refile.webserva.com'
        }
    },
    config: env => ({
        inq: {
            description: 'the queue to import',
            default: `${env.namespace}:in:q`
        },
        outq: {
            description: 'the output key queue',
            default: `${env.namespace}:out:q`
        },
        busyq: {
            description: 'the pending list for brpoplpush',
            default: `${env.namespace}:busy:q`
        },
        popTimeout: {
            description: 'the timeout for brpoplpush',
            unit: 'seconds',
            default: 10
        },
        loggerLevel: {
            description: 'the logging level',
            defaults: {
                production: 'info',
                test: 'info',
                development: 'debug'
            }
        }
    })
});

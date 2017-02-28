
const getRefileUrl = require('get-refile-url');
const fetch = require('node-fetch');

module.exports = async context => {
    const {config, logger, client} = context;
    Object.assign(global, context);
    logger.info({config});
    try {
        while (true) {
            const id = await client.brpoplpushAsync(config.inq, config.busyq, config.popTimeout);
            if (id === null) {
                logger.info('empty queue', config.inq);
                continue;
            }
            if (id === '') {
                logger.warn('popped blank', config.inq);
                continue;
            }
            if (id === 'exit') {
                logger.warn('popped exit', config.inq);
                await client.lrem(config.busyq, 1, id);
                break;
            }
            const key = ['place', id, 'j'].join(':');
            let [content] = await multiExecAsync(client, multi => {
                multi.get(key);
                multi.hincrby(`${config.namespace}:count:h`, 'get', 1);
            });
            if (!content) {
                if (false) {
                    throw new DataError('Empty', {key});
                }
                const refileUrl = getRefileUrl(config.refileDomain, key);
                const fetchRes = await fetch(refileUrl);
                if (fetchRes.status !== 200) {
                    logger.warn('status', fetchRes.status, refileUrl);
                    continue;
                }
                content = await fetchRes.text();
                logger.some('refile', key, refileUrl);
            }
            const parsedContent = JSON.parse(content);
            await multiExecAsync(client, multi => {
                multi.hincrby(`${config.namespace}:count:h`, 'update', 1);
            });
            logger.some('updated');
        }
    } catch (err) {
        throw err;
    } finally {
    }
};

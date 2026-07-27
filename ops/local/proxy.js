const net = require('net');

const REMOTE_IP = '172.25.0.25';

const proxies = [
    { local: 5432, remote: 5432, name: 'Database' },
    { local: 4236, remote: 4236, name: 'R Analytics Dashboard' },
    { local: 4241, remote: 4241, name: 'R Analytics API' }
];

proxies.forEach(({ local, remote, name }) => {
    net.createServer((from) => {
        const to = net.createConnection({
            host: REMOTE_IP,
            port: remote
        });
        
        from.on('error', (err) => {
            console.error(`[${name}] Client connection error:`, err.message);
            to.destroy();
        });
        
        to.on('error', (err) => {
            console.error(`[${name}] Server connection error:`, err.message);
            from.destroy();
        });

        from.pipe(to);
        to.pipe(from);
    }).listen(local, () => {
        console.log(`Proxy [${name}] listening on port ${local} -> ${REMOTE_IP}:${remote}`);
    });
});

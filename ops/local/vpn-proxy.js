const net = require('net');

const LOCAL_PORT = 5432;
const REMOTE_PORT = 5432;
const REMOTE_HOST = '172.25.0.25';

const server = net.createServer((localSocket) => {
    console.log(`[Proxy] Connection received from ${localSocket.remoteAddress}`);
    
    const remoteSocket = new net.Socket();
    remoteSocket.connect(REMOTE_PORT, REMOTE_HOST, () => {
        console.log(`[Proxy] Connected to VPN Database ${REMOTE_HOST}:${REMOTE_PORT}`);
        localSocket.pipe(remoteSocket);
        remoteSocket.pipe(localSocket);
    });

    remoteSocket.on('error', (err) => {
        console.error(`[Proxy] Remote socket error:`, err.message);
        localSocket.end();
    });

    localSocket.on('error', (err) => {
        console.error(`[Proxy] Local socket error:`, err.message);
        remoteSocket.end();
    });

    localSocket.on('close', () => {
        console.log(`[Proxy] Local connection closed`);
        remoteSocket.end();
    });

    remoteSocket.on('close', () => {
        console.log(`[Proxy] Remote connection closed`);
        localSocket.end();
    });
});

server.listen(LOCAL_PORT, "0.0.0.0", () => {
    console.log(`[Proxy] TCP Proxy listening on port ${LOCAL_PORT} forwarding to ${REMOTE_HOST}:${REMOTE_PORT}`);
    console.log(`[Proxy] Use DB_HOST=host.docker.internal in your backend.env`);
});

const net = require('net');

const LOCAL_PORT = 15432;
const REMOTE_HOST = '172.25.0.25';
const REMOTE_PORT = 5432;

const server = net.createServer((localSocket) => {
  const remoteSocket = new net.Socket();
  
  remoteSocket.connect(REMOTE_PORT, REMOTE_HOST, () => {
    localSocket.pipe(remoteSocket);
    remoteSocket.pipe(localSocket);
  });
  
  localSocket.on('error', (err) => console.error('Local socket error:', err.message));
  remoteSocket.on('error', (err) => console.error('Remote socket error:', err.message));
  
  localSocket.on('close', () => remoteSocket.destroy());
  remoteSocket.on('close', () => localSocket.destroy());
});

server.listen(LOCAL_PORT, '0.0.0.0', () => {
  console.log(`TCP Proxy listening on 0.0.0.0:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT}`);
});

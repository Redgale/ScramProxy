const http = require('http');
const { DataStream } = require('scramjet');

// 1. Configuration via Environment Variables
// Koyeb automatically provides the PORT variable.
const PORT = process.env.PORT || 8000; 
// You will set this variable in the Koyeb Dashboard.
const TARGET_URL = process.env.TARGET_URL || 'http://example.com'; 

const server = http.createServer((clientReq, clientRes) => {
    // Basic health check endpoint for Koyeb
    if (clientReq.url === '/health') {
        clientRes.writeHead(200, { 'Content-Type': 'text/plain' });
        clientRes.end('OK');
        return;
    }

    console.log(`[${new Date().toISOString()}] Proxying ${clientReq.method} request for: ${clientReq.url}`);

    // 2. Parse the target URL to handle paths correctly
    // This ensures we can proxy http://mysite.com/api even if TARGET_URL is just http://mysite.com
    const targetUrlObj = new URL(TARGET_URL);
    
    const options = {
        hostname: targetUrlObj.hostname,
        port: targetUrlObj.port || 80,
        path: clientReq.url, 
        method: clientReq.method,
        headers: clientReq.headers
    };

    // Remove host header to avoid conflicts with the target server
    // (The target expects its own host, not your Koyeb domain)
    delete options.headers['host'];

    // 3. Create the Proxy Request
    const proxyReq = http.request(options, (targetRes) => {
        // Forward status and headers
        clientRes.writeHead(targetRes.statusCode, targetRes.headers);

        // 4. Stream data with Scramjet
        DataStream.from(targetRes)
            .pipe(clientRes);
    });

    // Error Handling
    proxyReq.on('error', (e) => {
        console.error(`Proxy Error: ${e.message}`);
        if (!clientRes.headersSent) {
            clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
            clientRes.end('Bad Gateway');
        }
    });

    // Stream the client request body to the target (for POST/PUT)
    DataStream.from(clientReq).pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`🚀 Proxy server active on port ${PORT}`);
    console.log(`🔗 Target URL: ${TARGET_URL}`);
});

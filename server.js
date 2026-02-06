const express = require('express');
const http = require('http');
const https = require('https');
const { DataStream } = require('scramjet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check for Koyeb
app.get('/health', (req, res) => res.status(200).send('OK'));

// The Proxy Logic
app.get('/main', async (req, res) => {
    let targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('No URL provided');
    }

    // Basic URL cleaning
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const urlObj = new URL(targetUrl);
        const client = urlObj.protocol === 'https:' ? https : http;

        const requestOptions = {
            method: 'GET',
            headers: {
                'User-Agent': req.headers['user-agent'],
                'Accept': req.headers['accept'],
                'Accept-Language': req.headers['accept-language'],
            }
        };

        const proxyReq = client.request(targetUrl, requestOptions, (targetRes) => {
            // Forward headers and status
            res.writeHead(targetRes.statusCode, targetRes.headers);

            // Use Scramjet to pipe the data
            // You can add .map() or .filter() here to modify the HTML on the fly
            DataStream.from(targetRes)
                .pipe(res);
        });

        proxyReq.on('error', (err) => {
            res.status(500).send('Proxy Error: ' + err.message);
        });

        proxyReq.end();

    } catch (e) {
        res.status(500).send('Invalid URL');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ScramProxy is live on port ${PORT}`);
});
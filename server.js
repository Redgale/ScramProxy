const express = require('express');
const https = require('https');
const http = require('http');
const { DataStream } = require('scramjet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'public')));

// Use '*' to capture everything after /s/
app.get('/s/*', async (req, res) => {
    // Capture the target URL from the path
    let target = req.params[0]; 
    
    if (!target) return res.redirect('/');

    // Ensure protocol is present
    if (!target.startsWith('http')) target = 'https://' + target;

    try {
        const url = new URL(target);
        const protocol = url.protocol === 'https:' ? https : http;

        const options = {
            method: 'GET',
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                'Accept': req.headers['accept'],
                'Referer': url.origin
            }
        };

        const proxyReq = protocol.request(target, options, (targetRes) => {
            // 1. Strip security headers that "cook" the page (prevent iframing)
            const headers = { ...targetRes.headers };
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            delete headers['content-security-policy-report-only'];
            delete headers['cross-origin-resource-policy'];
            
            // Allow cross-origin for assets
            headers['Access-Control-Allow-Origin'] = '*';

            res.writeHead(targetRes.statusCode, headers);

            const contentType = headers['content-type'] || '';

            // 2. Use Scramjet to handle the stream
            if (contentType.includes('text/html')) {
                // If it's HTML, we inject the <base> tag to fix broken CSS/links
                DataStream.from(targetRes)
                    .map(chunk => chunk.toString())
                    .map(html => {
                        const baseTag = `<base href="${url.origin}${url.pathname}">`;
                        return html.replace('<head>', `<head>${baseTag}`);
                    })
                    .pipe(res);
            } else {
                // For images, scripts, and styles, stream directly
                DataStream.from(targetRes).pipe(res);
            }
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) res.status(500).send('Proxy Error: ' + err.message);
        });

        proxyReq.end();
    } catch (e) {
        res.status(500).send('Invalid URL format. Make sure it is a full URL.');
    }
});

app.listen(PORT, () => console.log(`🚀 Scramjet Proxy live on port ${PORT}`));
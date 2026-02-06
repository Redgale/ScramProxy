const express = require('express');
const https = require('https');
const http = require('http');
const { DataStream } = require('scramjet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/proxy', async (req, res) => {
    let target = req.query.url;
    if (!target) return res.status(400).send('URL is required');

    // Add protocol if missing
    if (!target.startsWith('http')) target = 'https://' + target;

    try {
        const url = new URL(target);
        const protocol = url.protocol === 'https:' ? https : http;

        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        };

        protocol.get(target, options, (targetRes) => {
            const contentType = targetRes.headers['content-type'] || '';
            
            // Forward status and headers
            res.writeHead(targetRes.statusCode, targetRes.headers);

            // SCRAMJET LOGIC: If it's HTML, inject a <base> tag to fix CSS/Links
            if (contentType.includes('text/html')) {
                DataStream.from(targetRes)
                    .map(chunk => chunk.toString())
                    .map(html => {
                        // Injects <base> right after <head> to fix all relative paths
                        return html.replace('<head>', `<head><base href="${url.origin}${url.pathname}">`);
                    })
                    .pipe(res);
            } else {
                // For images, CSS files, and JS, just pipe them directly
                targetRes.pipe(res);
            }
        }).on('error', (err) => {
            res.status(500).send('Proxy Error: ' + err.message);
        });
    } catch (e) {
        res.status(500).send('Invalid URL format');
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
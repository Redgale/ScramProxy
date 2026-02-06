const express = require('express');
const https = require('https');
const http = require('http');
const { DataStream } = require('scramjet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'public')));

// The "Service" endpoint handles all proxied traffic
app.get('/s/:url(*)', async (req, res) => {
    let target = req.params.url;
    if (!target) return res.redirect('/');

    // Handle protocol-less URLs
    if (!target.startsWith('http')) target = 'https://' + target;

    try {
        const url = new URL(target);
        const protocol = url.protocol === 'https:' ? https : http;

        const options = {
            method: 'GET',
            headers: {
                'User-Agent': req.headers['user-agent'],
                'Referer': url.origin
            }
        };

        const proxyReq = protocol.request(target, options, (targetRes) => {
            // 1. STRIP SECURITY HEADERS (The "Uncook" Step)
            const headers = { ...targetRes.headers };
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            delete headers['content-security-policy-report-only'];
            delete headers['cross-origin-resource-policy'];

            // 2. Add CORS so the browser allows the assets
            headers['Access-Control-Allow-Origin'] = '*';

            res.writeHead(targetRes.statusCode, headers);

            const contentType = headers['content-type'] || '';

            // 3. Inject Base Tag for HTML
            if (contentType.includes('text/html')) {
                DataStream.from(targetRes)
                    .map(chunk => chunk.toString())
                    .map(html => {
                        // Injects a base tag so relative links resolve back to our proxy
                        const baseTag = `<base href="/s/${url.origin}${url.pathname}">`;
                        return html.replace('<head>', `<head>${baseTag}`);
                    })
                    .pipe(res);
            } else {
                targetRes.pipe(res);
            }
        });

        proxyReq.on('error', (err) => res.status(500).send('Proxy Error: ' + err.message));
        proxyReq.end();
    } catch (e) {
        res.status(500).send('Invalid URL');
    }
});

app.listen(PORT, () => console.log(`🚀 ScramProxy Uncooked is live on port ${PORT}`));
const express = require('express');
const https = require('https');
const http = require('http');
const { DataStream } = require('scramjet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, 'public')));

// The fix: ':target*' gives the wildcard a name so the parser doesn't crash
app.get('/s/:target*', async (req, res) => {
    // We reconstruct the URL by taking the 'target' param and the rest of the path
    let target = req.params.target + req.params[0];
    
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
            const headers = { ...targetRes.headers };
            
            // Uncook the site: Remove security headers that block iframes
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            delete headers['content-security-policy-report-only'];
            delete headers['cross-origin-resource-policy'];
            
            headers['Access-Control-Allow-Origin'] = '*';

            res.writeHead(targetRes.statusCode, headers);

            const contentType = headers['content-type'] || '';

            if (contentType.includes('text/html')) {
                DataStream.from(targetRes)
                    .map(chunk => chunk.toString())
                    .map(html => {
                        // Injecting base tag so relative assets load via our proxy
                        const baseTag = `<base href="${url.origin}${url.pathname}">`;
                        return html.replace('<head>', `<head>${baseTag}`);
                    })
                    .pipe(res);
            } else {
                DataStream.from(targetRes).pipe(res);
            }
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) res.status(502).send('Bad Gateway');
        });

        proxyReq.end();
    } catch (e) {
        res.status(400).send('Invalid URL format.');
    }
});

app.listen(PORT, () => console.log(`🚀 Proxy listening on port ${PORT}`));
# StyleStack Backend API

The Express 5 REST API for StyleStack, providing apparel catalog management, simulated multi-channel checkout, inventory tracking, and administrative analytics.

## Security Headers & Middleware

StyleStack implements [`helmet`](https://helmetjs.github.io/) middleware to harden the Express API against common web vulnerabilities, including Cross-Site Scripting (XSS), clickjacking, MIME sniffing, and cross-site resource leaks.

### Active Security Policies & Headers

| Header | Value / Policy | Purpose |
| :--- | :--- | :--- |
| `Content-Security-Policy` | Restrictive directive list (`default-src 'self'`, etc.) | Mitigates XSS, unauthorized code execution, and data injection. |
| `X-Frame-Options` | `DENY` | Prevents clickjacking by prohibiting rendering inside `<iframe>`, `<frame>`, or `<object>`. |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing to prevent browsers from interpreting non-script MIME types as executable scripts. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS connections across all domains and subdomains (sent on secure/proxied requests). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protects privacy and sensitive query params by limiting referrer data sent in cross-origin requests. |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Allows the decoupled Vite frontend (`http://localhost:5173` or Azure CDN) to fetch API resources and uploads. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates browsing context to protect against Spectre-like side-channel attacks and window opener exploits. |
| `X-Powered-By` | *Removed* (`app.disable('x-powered-by')`) | Obscures Express/Node.js technology fingerprint from automated scanners. |

### Content Security Policy (CSP) Directives

The `contentSecurityPolicy` directives configured in `backend/src/app.js`:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
    connectSrc: [
      "'self'",
      'http://localhost:*',
      'http://127.0.0.1:*',
      'https://*.azurewebsites.net',
      'https://*.azurestaticapps.net',
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },
}
```

### Instructions for Adjusting CSP Directives

When integrating new external third-party services, CDNs, or analytics providers, update `backend/src/app.js`:

- **New Image Providers (e.g., AWS S3, Cloudinary, Imgur):** Add the bucket or CDN domain to the `imgSrc` array:
  ```javascript
  imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'https://res.cloudinary.com']
  ```
- **New Font Providers (e.g., Adobe Typekit):** Add the provider URL to `fontSrc` and `styleSrc`:
  ```javascript
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://use.typekit.net', 'data:']
  ```
- **New External APIs or WebSocket Endpoints:** Add the external API origin to `connectSrc`:
  ```javascript
  connectSrc: ["'self'", 'http://localhost:*', 'https://api.external-service.com']
  ```
- **Payment Gateways or Embedded Modals:** If embedding external iframe widgets (such as 3D Secure verification frames), add the trusted domain to `frameSrc`:
  ```javascript
  frameSrc: ["'self'", 'https://api.razorpay.com']
  ```

## Running Tests

Execute security header assertions and endpoint integration tests:

```bash
npm test
```

Or run the dedicated security suite:

```bash
npx jest tests/security.test.js --runInBand
```

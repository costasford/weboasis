// Self-hosted CORS proxy for WebOasis (news/, tech/, twitter/ feed readers).
// Deploy to Cloudflare Workers, then call it exactly like the old cors.club
// dependency: https://<your-worker>.workers.dev/https://target-url-here
//
// This replaces the free third-party cors.club proxy the site depended on,
// which is unreliable and outside your control.

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.pathname.slice(1) + url.search

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return new Response('Usage: /https://example.com/path/to/feed.xml', { status: 400 })
  }

  if (request.method === 'OPTIONS') {
    // Echo back whatever headers the browser is actually asking to send
    // (e.g. the RSS reader libraries set a custom "accept" header on every
    // request) instead of a fixed allow-list — a hardcoded list here was
    // silently failing preflight for any caller using non-default headers,
    // which blocks the real request before it's ever sent: no network
    // entry, no error, nothing to catch client-side.
    const requestedHeaders = request.headers.get('Access-Control-Request-Headers') || 'Content-Type'
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': requestedHeaders,
      },
    })
  }

  // Fetch explicitly (not by cloning the incoming request) so redirect mode
  // is always "follow" — the target's 3xx responses get resolved server-side
  // and never reach the client, which previously caused requests to hang
  // forever on a malformed URL (the browser resolving a relative Location
  // header against this worker's own origin instead of the target's).
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebOasisProxy/1.0)' },
    redirect: 'follow',
  })

  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.append('Vary', 'Origin')
  return newResponse
}

// Self-hosted backend for WebOasis's ShortURL and Forum tools.
// Deploy to Cloudflare Workers (dashboard > Workers & Pages > Create > paste
// this in) with two bindings added under Settings > Variables:
//   - KV namespace binding named SHORTLINKS
//   - D1 database binding named FORUM_DB (run js/site_services_schema.sql
//     once against it via the D1 console before first use)
//
// One Worker instead of two, since ShortURL and Forum are both small,
// low-traffic, and this keeps the Cloudflare footprint down.

const ALLOWED_ORIGIN = "https://costasford.github.io";
const SHORT_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/l
const MIN_POST_INTERVAL_SECONDS = 20; // per-IP, per-write-endpoint

function corsHeaders(extra) {
	return Object.assign(
		{
			"Access-Control-Allow-Origin": ALLOWED_ORIGIN,
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			Vary: "Origin",
		},
		extra || {}
	);
}

function json(data, status, extraHeaders) {
	return new Response(JSON.stringify(data), {
		status: status || 200,
		headers: corsHeaders(Object.assign({ "Content-Type": "application/json" }, extraHeaders || {})),
	});
}

function randomCode(length) {
	var out = "";
	var bytes = crypto.getRandomValues(new Uint8Array(length));
	for (var i = 0; i < length; i++) {
		out += SHORT_CODE_ALPHABET[bytes[i] % SHORT_CODE_ALPHABET.length];
	}
	return out;
}

async function rateLimit(env, request, bucket) {
	var ip = request.headers.get("CF-Connecting-IP") || "unknown";
	var key = "rl:" + bucket + ":" + ip;
	var hit = await env.SHORTLINKS.get(key);
	if (hit) return false;
	await env.SHORTLINKS.put(key, "1", { expirationTtl: MIN_POST_INTERVAL_SECONDS });
	return true;
}

function isValidHttpUrl(value) {
	try {
		var u = new URL(value);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch (e) {
		return false;
	}
}

async function handleShorten(request, env) {
	var body;
	try {
		body = await request.json();
	} catch (e) {
		return json({ error: "Invalid JSON body" }, 400);
	}
	var targetUrl = (body && body.url || "").trim();
	if (!isValidHttpUrl(targetUrl)) {
		return json({ error: "Provide a valid http(s) URL" }, 400);
	}
	if (!(await rateLimit(env, request, "shorten"))) {
		return json({ error: "Slow down — try again shortly" }, 429);
	}

	var code;
	for (var attempt = 0; attempt < 5; attempt++) {
		code = randomCode(6);
		var existing = await env.SHORTLINKS.get("link:" + code);
		if (!existing) break;
		code = null;
	}
	if (!code) return json({ error: "Could not allocate a short code, try again" }, 500);

	await env.SHORTLINKS.put("link:" + code, targetUrl);
	return json({ code: code, url: targetUrl });
}

async function handleRedirect(code, env) {
	var targetUrl = await env.SHORTLINKS.get("link:" + code);
	if (!targetUrl) return new Response("Short link not found", { status: 404, headers: corsHeaders() });
	return Response.redirect(targetUrl, 302);
}

function clampText(value, maxLength) {
	return (value || "").toString().trim().slice(0, maxLength);
}

async function handleListThreads(env) {
	var result = await env.FORUM_DB.prepare(
		"SELECT t.id, t.title, t.author_name, t.created_at, " +
			"(SELECT COUNT(*) FROM replies r WHERE r.thread_id = t.id) AS reply_count " +
			"FROM threads t ORDER BY t.created_at DESC LIMIT 100"
	).all();
	return json({ threads: result.results });
}

async function handleCreateThread(request, env) {
	var body;
	try {
		body = await request.json();
	} catch (e) {
		return json({ error: "Invalid JSON body" }, 400);
	}
	var title = clampText(body.title, 200);
	var text = clampText(body.body, 5000);
	var author = clampText(body.author_name, 60) || "Anonymous";
	if (!title || !text) return json({ error: "title and body are required" }, 400);
	if (!(await rateLimit(env, request, "thread"))) {
		return json({ error: "Slow down — try again shortly" }, 429);
	}

	var result = await env.FORUM_DB.prepare(
		"INSERT INTO threads (title, body, author_name) VALUES (?, ?, ?)"
	)
		.bind(title, text, author)
		.run();
	return json({ id: result.meta.last_row_id }, 201);
}

async function handleGetThread(threadId, env) {
	var thread = await env.FORUM_DB.prepare("SELECT id, title, body, author_name, created_at FROM threads WHERE id = ?")
		.bind(threadId)
		.first();
	if (!thread) return json({ error: "Thread not found" }, 404);
	var replies = await env.FORUM_DB.prepare(
		"SELECT id, body, author_name, created_at FROM replies WHERE thread_id = ? ORDER BY created_at ASC"
	)
		.bind(threadId)
		.all();
	return json({ thread: thread, replies: replies.results });
}

async function handleCreateReply(threadId, request, env) {
	var body;
	try {
		body = await request.json();
	} catch (e) {
		return json({ error: "Invalid JSON body" }, 400);
	}
	var text = clampText(body.body, 5000);
	var author = clampText(body.author_name, 60) || "Anonymous";
	if (!text) return json({ error: "body is required" }, 400);

	var thread = await env.FORUM_DB.prepare("SELECT id FROM threads WHERE id = ?").bind(threadId).first();
	if (!thread) return json({ error: "Thread not found" }, 404);

	if (!(await rateLimit(env, request, "reply"))) {
		return json({ error: "Slow down — try again shortly" }, 429);
	}

	var result = await env.FORUM_DB.prepare(
		"INSERT INTO replies (thread_id, body, author_name) VALUES (?, ?, ?)"
	)
		.bind(threadId, text, author)
		.run();
	return json({ id: result.meta.last_row_id }, 201);
}

export default {
	async fetch(request, env) {
		var url = new URL(request.url);
		var path = url.pathname;

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders() });
		}

		try {
			if (path === "/shorten" && request.method === "POST") {
				return await handleShorten(request, env);
			}
			var shortMatch = path.match(/^\/s\/([A-Za-z0-9]+)$/);
			if (shortMatch && request.method === "GET") {
				return await handleRedirect(shortMatch[1], env);
			}

			if (path === "/forum/threads" && request.method === "GET") {
				return await handleListThreads(env);
			}
			if (path === "/forum/threads" && request.method === "POST") {
				return await handleCreateThread(request, env);
			}
			var threadMatch = path.match(/^\/forum\/threads\/(\d+)$/);
			if (threadMatch && request.method === "GET") {
				return await handleGetThread(threadMatch[1], env);
			}
			var replyMatch = path.match(/^\/forum\/threads\/(\d+)\/replies$/);
			if (replyMatch && request.method === "POST") {
				return await handleCreateReply(replyMatch[1], request, env);
			}

			return json({ error: "Not found" }, 404);
		} catch (err) {
			return json({ error: "Internal error: " + err.message }, 500);
		}
	},
};

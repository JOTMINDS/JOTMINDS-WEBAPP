const ALLOWED_MODELS = ['gpt-4o-mini'];
const MAX_BODY_CHARS = 200_000;
const MAX_MESSAGES = 60;
const DEFAULT_MAX_TOKENS = 1200;
const MAX_TOKENS_CAP = 2000;

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*jotminds\.com$/,
  /^https:\/\/([a-z0-9-]+\.)*jotminds\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

function isAllowedOrigin(origin: string) {
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

function jsonResponse(data: unknown, status: number, origin: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

// Rebuilds the upstream request from an allowlist of fields so callers cannot
// pick another model, raise n/max_tokens, enable tools or streaming, etc.
function buildUpstreamBody(input: any): { body?: Record<string, unknown>; error?: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Request body must be a JSON object' };
  }
  if (!ALLOWED_MODELS.includes(input.model)) {
    return { error: 'Unsupported model' };
  }
  const messages = input.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return { error: `messages must be an array of 1 to ${MAX_MESSAGES} items` };
  }
  for (const message of messages) {
    const validRole = message && ['system', 'user', 'assistant'].includes(message.role);
    if (!validRole || typeof message.content !== 'string') {
      return { error: 'Each message needs a role (system, user or assistant) and string content' };
    }
  }

  const requestedTokens = Math.floor(Number(input.max_tokens)) || DEFAULT_MAX_TOKENS;
  const body: Record<string, unknown> = {
    model: input.model,
    messages: messages.map(({ role, content }: any) => ({ role, content })),
    max_tokens: Math.min(Math.max(requestedTokens, 1), MAX_TOKENS_CAP),
  };
  if (typeof input.temperature === 'number') {
    body.temperature = Math.min(Math.max(input.temperature, 0), 2);
  }
  if (input.response_format?.type === 'json_object') {
    body.response_format = { type: 'json_object' };
  }
  return { body };
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const origin = request.headers.get('Origin');

  // Browsers always send Origin on cross-site requests; non-browser clients
  // (curl, the Vite dev proxy) omit it and are not restricted by CORS anyway.
  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'Origin not allowed' }, 403, null);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: 'Server missing OPENAI_API_KEY environment variable' }, 500, origin);
  }

  if (Number(request.headers.get('Content-Length')) > MAX_BODY_CHARS) {
    return jsonResponse({ error: 'Request too large' }, 413, origin);
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_CHARS) {
      return jsonResponse({ error: 'Request too large' }, 413, origin);
    }

    let input: any;
    try {
      input = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: 'Request body is not valid JSON' }, 400, origin);
    }

    const { body, error } = buildUpstreamBody(input);
    if (!body) {
      return jsonResponse({ error }, 400, origin);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return jsonResponse(data, response.status, origin);
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500, origin);
  }
}

export async function onRequestOptions(context: any) {
  const origin = context.request.headers.get('Origin');
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(null, { status: 403 });
  }

  const headers: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(null, { status: 204, headers });
}

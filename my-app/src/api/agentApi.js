/**
 * API helpers for the lab assistant agent.
 */
const API_BASE = 'http://localhost:5001/api';

async function parseJsonSafe(res) {
  return await res.json().catch(() => null);
}

export async function listAgentModels() {
  const res = await fetch(`${API_BASE}/agent/models`);
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true, data };
}

export async function chatWithAgent({ messages, canvasContext }) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, canvasContext }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error ?? `Request failed (${res.status})`,
    };
  }

  return {
    ok: true,
    type: data?.type ?? 'message',
    reply: data?.reply ?? '',
    cycle: data?.cycle ?? null,
    modelId: data?.modelId ?? null,
    modelLabel: data?.modelLabel ?? null,
    usedFallback: Boolean(data?.usedFallback),
  };
}

export async function getAgentKeyStatus() {
  const res = await fetch(`${API_BASE}/agent/keys`);
  const data = await parseJsonSafe(res);
  if(!res.ok) {
    return {
      ok: false,
      error: data?.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true, data };
}

export async function saveAgentKeys({ geminiApiKey, openRouterApiKey }) {
  const res = await fetch(`${API_BASE}/agent/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geminiApiKey, openRouterApiKey }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error ?? `Request failed (${res.status})`,
    };
  }
  return { ok: true, data };
}

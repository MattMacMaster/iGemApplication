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

export async function chatWithAgent({ messages, canvasContext, modelId }) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, canvasContext, modelId }),
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
    reply: data?.reply ?? '',
    modelId: data?.modelId ?? modelId ?? null,
    usedFallback: Boolean(data?.usedFallback),
  };
}

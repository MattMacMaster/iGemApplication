import { useState, useEffect } from 'react';
import { getAgentKeyStatus, saveAgentKeys } from '../../api/agentApi';

/**
 * BYOK settings: save Gemini / OpenRouter keys on this machine.
 * open/onClose controlled by App (same pattern as LoadCycleDialog).
 */
export default function AgentSettingsDialog({ open, onClose }) {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [status, setStatus] = useState({
    geminiConfigured: false,
    openRouterConfigured: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // When the dialog opens, ask the server which keys exist (booleans only).
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      const result = await getAgentKeyStatus();
      if (cancelled || !result.ok) return;
      setStatus(result.data);
      setGeminiApiKey('');
      setOpenRouterApiKey('');
      setMessage('');
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const applySaveResult = (result, successMessage) => {
    if (!result.ok) {
      setMessage(result.error || 'Save failed');
      return;
    }
    setStatus(result.data);
    setGeminiApiKey('');
    setOpenRouterApiKey('');
    setMessage(successMessage);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    // Blank field = leave that key unchanged.
    const payload = {};
    if (geminiApiKey.trim()) payload.geminiApiKey = geminiApiKey.trim();
    if (openRouterApiKey.trim()) payload.openRouterApiKey = openRouterApiKey.trim();

    if (!payload.geminiApiKey && !payload.openRouterApiKey) {
      setSaving(false);
      setMessage('Nothing to save. Paste a key, or use Clear.');
      return;
    }

    const result = await saveAgentKeys(payload);
    setSaving(false);
    applySaveResult(result, 'Saved. Keys stay on this device.');
  };

  const handleClearGemini = async () => {
    setSaving(true);
    setMessage('');
    const result = await saveAgentKeys({ geminiApiKey: '' });
    setSaving(false);
    applySaveResult(result, 'Gemini key cleared.');
  };

  const handleClearOpenRouter = async () => {
    setSaving(true);
    setMessage('');
    const result = await saveAgentKeys({ openRouterApiKey: '' });
    setSaving(false);
    applySaveResult(result, 'OpenRouter key cleared.');
  };

  return (
    <div
      className="loadmenu-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-settings-title"
    >
      <div className="loadmenu">
        <div className="loadmenu__header">
          <div id="agent-settings-title" className="loadmenu__title">
            Agent Settings
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="loadmenu__body" onSubmit={handleSave}>
          <p style={{ marginTop: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
            Optional. Keys are stored on this machine only. Leave a field blank to keep the current key.
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13 }}>
              Gemini
              <span style={{ marginLeft: 8, opacity: 0.7 }}>
                {status.geminiConfigured ? '(configured)' : '(not set)'}
              </span>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Paste Gemini API key"
                autoComplete="off"
                style={{ display: 'block', width: '100%', marginTop: 4, boxSizing: 'border-box' }}
              />
            </label>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 6 }}
              onClick={handleClearGemini}
              disabled={saving || !status.geminiConfigured}
            >
              Clear
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13 }}>
              OpenRouter
              <span style={{ marginLeft: 8, opacity: 0.7 }}>
                {status.openRouterConfigured ? '(configured)' : '(not set)'}
              </span>
              <input
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="Paste OpenRouter API key"
                autoComplete="off"
                style={{ display: 'block', width: '100%', marginTop: 4, boxSizing: 'border-box' }}
              />
            </label>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 6 }}
              onClick={handleClearOpenRouter}
              disabled={saving || !status.openRouterConfigured}
            >
              Clear
            </button>
          </div>

          {message && <p style={{ fontSize: 13 }}>{message}</p>}

          <button type="submit" className="btn-secondary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

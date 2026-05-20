import React, { useEffect, useState } from 'react';
import { webhooksApi, canWrite } from '../services/api';

export default function WebhooksPage() {
  const writer = canWrite();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [draft, setDraft] = useState({ name: '', url: '', secret: '', events: '', active: true });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await webhooksApi.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editingId) await webhooksApi.update(editingId, draft);
      else await webhooksApi.create(draft);
      setDraft({ name: '', url: '', secret: '', events: '', active: true });
      setEditingId(null);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Webhooks</h2><p>Outbound HTTP notifications for apiary events.</p></div>
      </div>

      {err && <div className="ai-error">{err}</div>}

      {writer && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-grid">
            <div className="form-group"><label>Name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="form-group"><label>URL</label>
              <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></div>
            <div className="form-group"><label>Secret</label>
              <input value={draft.secret} onChange={(e) => setDraft({ ...draft, secret: e.target.value })} /></div>
            <div className="form-group full-width"><label>Events (comma-separated)</label>
              <input value={draft.events} onChange={(e) => setDraft({ ...draft, events: e.target.value })}
                placeholder="disease_outbreaks.created,varroa_counts.critical" /></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={save}>{editingId ? 'Update' : 'Create'}</button>
            {editingId && (
              <button className="btn secondary" style={{ marginLeft: 8 }}
                onClick={() => { setEditingId(null); setDraft({ name: '', url: '', secret: '', events: '', active: true }); }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? <div className="empty-state">Loading...</div> :
        rows.length === 0 ? <div className="empty-state">No webhooks configured.</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>URL</th><th>Events</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.name}</td>
                  <td style={{ fontSize: 12 }}>{r.url}</td>
                  <td style={{ fontSize: 12 }}>{r.events}</td>
                  <td>{r.active ? 'yes' : 'no'}</td>
                  <td>
                    {writer && (
                      <>
                        <button className="btn secondary" onClick={() => { setEditingId(r.id); setDraft(r); }}>Edit</button>
                        <button className="btn danger" style={{ marginLeft: 6 }}
                          onClick={async () => { if (window.confirm('Delete?')) { await webhooksApi.remove(r.id); load(); } }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

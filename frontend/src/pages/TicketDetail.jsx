import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx';

const STATUS_OPTIONS = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user.role === 'agent' || user.role === 'admin';

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
    if (isStaff) {
      api.get('/users/agents').then(({ data }) => setAgents(data.data)).catch(() => {});
    }
  }, [fetchTicket, isStaff]);

  const applyUpdate = async (changes) => {
    setActionError('');
    try {
      const { data } = await api.patch(`/tickets/${id}`, {
        version: ticket.version,
        ...changes,
      });
      setTicket({ ...ticket, ...data.data });
      fetchTicket(); // refresh comments/history too
    } catch (err) {
      if (err.response?.status === 409) {
        setActionError('This ticket changed elsewhere - reloading latest version.');
        fetchTicket();
      } else {
        setActionError(err.response?.data?.message || 'Update failed');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPosting(true);
    try {
      await api.post(`/tickets/${id}/comments`, {
        body: commentBody,
        isInternal,
      });
      setCommentBody('');
      setIsInternal(false);
      fetchTicket();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!ticket) return null;

  const canEdit = isStaff || (ticket.createdBy === user.id && ticket.status === 'open');

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-slate-400 mb-1">{ticket.ticketNumber}</p>
            <h1 className="text-xl font-semibold">{ticket.subject}</h1>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
        <p className="text-slate-600 whitespace-pre-wrap mt-3">{ticket.description}</p>
        <div className="text-xs text-slate-400 mt-4 flex gap-4">
          <span>Requester: {ticket.creator?.name}</span>
          <span>Assigned: {ticket.agent?.name || 'Unassigned'}</span>
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {actionError}
        </div>
      )}

      {isStaff && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Manage Ticket</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select
                value={ticket.status}
                onChange={(e) => applyUpdate({ status: e.target.value })}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => applyUpdate({ priority: e.target.value })}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Assigned to</label>
              <select
                value={ticket.assignedTo || ''}
                onChange={(e) =>
                  applyUpdate({ assignedTo: e.target.value || null })
                }
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Comments</h2>
        <div className="space-y-3 mb-4">
          {ticket.comments?.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet.</p>
          )}
          {ticket.comments?.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg px-4 py-3 text-sm ${
                c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  {c.author?.name}{' '}
                  <span className="text-xs text-slate-400">({c.author?.role})</span>
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              {c.isInternal && (
                <span className="text-xs text-amber-700 font-medium">Internal note</span>
              )}
              <p className="whitespace-pre-wrap mt-1">{c.body}</p>
            </div>
          ))}
        </div>

        {canEdit && (
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              placeholder="Add a comment…"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex items-center justify-between">
              {isStaff && (
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  Internal note (not visible to requester)
                </label>
              )}
              <button
                type="submit"
                disabled={posting}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-1.5 rounded-md disabled:opacity-60 ml-auto"
              >
                {posting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">History</h2>
        <ul className="space-y-2">
          {ticket.history?.map((h) => (
            <li key={h.id} className="text-xs text-slate-500 flex gap-2">
              <span className="text-slate-400">
                {new Date(h.createdAt).toLocaleString()}
              </span>
              <span>
                {h.changer?.name} changed status{' '}
                {h.fromStatus ? `from ${h.fromStatus} ` : ''}to {h.toStatus}
                {h.note ? ` — ${h.note}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

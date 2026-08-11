import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx';

const STATUS_OPTIONS = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function TicketList() {
  const { user } = useAuth();
  const isStaff = user.role === 'agent' || user.role === 'admin';

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get('/tickets', { params });
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {isStaff ? 'All Tickets' : 'My Tickets'}
        </h1>
        {!isStaff && (
          <Link
            to="/tickets/new"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            + New Ticket
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search subject or ticket #"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket #</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              {isStaff && <th className="px-4 py-3 font-medium">Requester</th>}
              <th className="px-4 py-3 font-medium">Assigned</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No tickets found.
                </td>
              </tr>
            )}
            {!loading &&
              tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="text-brand-600 font-medium">
                      {t.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{t.subject}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  {isStaff && <td className="px-4 py-3">{t.creator?.name}</td>}
                  <td className="px-4 py-3">{t.agent?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setFilters((f) => ({ ...f, page: p }))}
                className={`w-8 h-8 rounded-md text-sm ${
                  p === pagination.page
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

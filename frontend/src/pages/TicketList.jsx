import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx';

const STATUS_OPTIONS = [
  'open',
  'in_progress',
  'on_hold',
  'resolved',
  'closed',
];

const PRIORITY_OPTIONS = [
  'low',
  'medium',
  'high',
  'urgent',
];

export default function TicketList() {
  const { user } = useAuth();
  const isStaff = user.role === 'agent' || user.role === 'admin';

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState([]);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    search: '',
    page: 1,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: filters.page,
        limit: 10,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.priority) {
        params.priority = filters.priority;
      }

      if (filters.assignedTo) {
        params.assignedTo = filters.assignedTo;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const { data } = await api.get('/tickets', { params });

      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load tickets'
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data } = await api.get('/users/agents');
        setAgents(data.data);
      } catch (err) {
        console.error('Failed to load agents', err);
      }
    };

    fetchAgents();
  }, []);

  const updateFilter = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: value,
      page: 1,
    }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStaff ? 'All Tickets' : 'My Tickets'}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isStaff
              ? 'Manage and track all support tickets'
              : 'View and manage your support tickets'}
          </p>
        </div>

        {!isStaff && (
          <Link
            to="/tickets/new"
            className="inline-flex w-fit items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            + New Ticket
          </Link>
        )}

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        {/* Search */}
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Search subject or ticket #"
            value={filters.search}
            onChange={(e) =>
              updateFilter('search', e.target.value)
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) =>
            updateFilter('status', e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-40"
        >
          <option value="">All statuses</option>

          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) =>
            updateFilter('priority', e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-40"
        >
          <option value="">All priorities</option>

          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Assignee */}
        <select
          value={filters.assignedTo}
          onChange={(e) =>
            updateFilter('assignedTo', e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-44"
        >
          <option value="">All assignees</option>

          <option value="unassigned">
            Unassigned
          </option>

          {agents.map((agent) => (
            <option
              key={agent.id}
              value={agent.id}
            >
              {agent.name}
            </option>
          ))}
        </select>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          TICKETS TABLE
      ====================================================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-left text-slate-600">

              <tr>

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Ticket #
                </th>

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Subject
                </th>

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Status
                </th>

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Priority
                </th>

                {isStaff && (
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    Requester
                  </th>
                )}

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Assigned
                </th>

                <th className="whitespace-nowrap px-4 py-3 font-medium">
                  Created
                </th>

              </tr>

            </thead>

            <tbody>

              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    Loading…
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}

              {/* Tickets */}
              {!loading &&
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        to={`/tickets/${t.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {t.subject}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <PriorityBadge
                        priority={t.priority}
                      />
                    </td>

                    {isStaff && (
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {t.creator?.name}
                      </td>
                    )}

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {t.agent?.name || '—'}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {new Date(
                        t.createdAt
                      ).toLocaleDateString()}
                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">

          {Array.from(
            {
              length: pagination.totalPages,
            },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: p,
                }))
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                p === pagination.page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}

        </div>
      )}

    </div>
  );
}
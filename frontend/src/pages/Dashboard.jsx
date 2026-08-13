import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL;

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  closed: 'Closed',
};

const statusClasses = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  on_hold: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityClasses = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const isStaff = isAdmin || isAgent;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('accessToken');

        const response = await axios.get(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const priorityOverview = dashboard?.priorityOverview || {};
  const myWorkload = dashboard?.myWorkload;
  const agentWorkload = dashboard?.agentWorkload || [];
  const recentTickets = dashboard?.recentTickets || [];
  const assignedToMe = dashboard?.assignedToMe || [];

  const summaryCards = [
    {
      label: 'Total Tickets',
      value: summary.total ?? 0,
    },
    {
      label: 'Open',
      value: summary.open ?? 0,
    },
    {
      label: 'In Progress',
      value: summary.inProgress ?? 0,
    },
    {
      label: 'Resolved',
      value: summary.resolved ?? 0,
    },
  ];

  const statusOverview = [
    {
      key: 'open',
      label: 'Open',
      value: summary.open ?? 0,
      className: 'bg-blue-500',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: summary.inProgress ?? 0,
      className: 'bg-yellow-500',
    },
    {
      key: 'onHold',
      label: 'On Hold',
      value: summary.onHold ?? 0,
      className: 'bg-orange-500',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: summary.resolved ?? 0,
      className: 'bg-green-500',
    },
    {
      key: 'closed',
      label: 'Closed',
      value: summary.closed ?? 0,
      className: 'bg-gray-500',
    },
  ];

  const priorityOverviewItems = [
    {
      label: 'Low',
      value: priorityOverview.low ?? 0,
      className: 'bg-gray-400',
    },
    {
      label: 'Medium',
      value: priorityOverview.medium ?? 0,
      className: 'bg-blue-500',
    },
    {
      label: 'High',
      value: priorityOverview.high ?? 0,
      className: 'bg-orange-500',
    },
    {
      label: 'Urgent',
      value: priorityOverview.urgent ?? 0,
      className: 'bg-red-500',
    },
  ];

  const totalStatusTickets = statusOverview.reduce(
    (total, item) => total + item.value,
    0
  );

  const totalPriorityTickets = priorityOverviewItems.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStaff ? 'Dashboard' : 'My Dashboard'}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>

        {!isStaff && (
          <Link
            to="/tickets/new"
            className="inline-flex w-fit items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Create New Ticket
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      {!isAgent && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
          </div>
      )}

      {/* Agent Workload */}
      {isAgent && myWorkload && (
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              My Workload
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your currently active tickets
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-500">Open</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myWorkload.open}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-gray-500">
                In Progress
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myWorkload.inProgress}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-sm text-gray-500">
                On Hold
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myWorkload.onHold}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {myWorkload.active}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* My Assigned Tickets - Agent/Admin */}
      {isAgent && (
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              My Assigned Tickets
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tickets currently assigned to you
            </p>
          </div>

          {assignedToMe.length > 0 ? (
            <div className="divide-y">
              {assignedToMe.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-600">
                        {ticket.subject}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusClasses[ticket.status] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[ticket.status] ||
                          ticket.status}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          priorityClasses[ticket.priority] ||
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              No active tickets are currently assigned to you.
            </div>
          )}
        </section>
      )}

      {/* Admin: Status & Priority Overview */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Status Overview */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Ticket Status Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current distribution of all tickets
              </p>
            </div>

            <div className="space-y-5 p-5">
              {statusOverview.map((item) => {
                const percentage =
                  totalStatusTickets > 0
                    ? (item.value / totalStatusTickets) * 100
                    : 0;

                return (
                  <div key={item.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {item.label}
                      </span>

                      <span className="text-gray-500">
                        {item.value}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${item.className}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Priority Overview */}
          <section className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Priority Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Ticket distribution by priority
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5">
              {priorityOverviewItems.map((item) => {
                const percentage =
                  totalPriorityTickets > 0
                    ? (item.value / totalPriorityTickets) * 100
                    : 0;

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">
                        {item.label}
                      </p>

                      <p className="text-xl font-bold text-gray-900">
                        {item.value}
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${item.className}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Agent Workload - Admin */}
      {isAdmin && (
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Agent Workload
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Active workload across support agents
            </p>
          </div>

          {agentWorkload.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Agent
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Open
                    </th>
                    <th className="px-5 py-3 font-medium">
                      In Progress
                    </th>
                    <th className="px-5 py-3 font-medium">
                      On Hold
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Active
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {agentWorkload.map((agent) => (
                    <tr key={agent.id}>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {agent.name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {agent.open}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {agent.inProgress}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {agent.onHold}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {agent.active}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              No active agents found.
            </div>
          )}
        </section>
      )}

      {/* Status Overview - Agent */}
      {/* {isAgent && (
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Ticket Status Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current ticket distribution
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-5">
            {statusOverview.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border p-4"
              >
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )} */}

      {/* Priority Overview - Agent */}
      {/* {isAgent && (
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Priority Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current priority distribution
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            {priorityOverviewItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border p-4"
              >
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )} */}

      {/* Recent Tickets */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            {isStaff ? 'Recent Tickets' : 'My Recent Tickets'}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Recently updated tickets
          </p>
        </div>

        {recentTickets.length > 0 ? (
          <div className="divide-y">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block px-5 py-4 hover:bg-gray-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.ticketNumber}
                    </p>

                    <p className="mt-1 truncate text-sm text-gray-600">
                      {ticket.subject}
                    </p>

                    {ticket.category && (
                      <p className="mt-1 text-xs text-gray-400">
                        {ticket.category}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusClasses[ticket.status] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusLabels[ticket.status] ||
                        ticket.status}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        priorityClasses[ticket.priority] ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            No tickets found.
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
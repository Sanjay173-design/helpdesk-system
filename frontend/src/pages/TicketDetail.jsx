import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff =
    user.role === 'agent' ||
    user.role === 'admin';

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
      setError(
        err.response?.data?.message ||
          'Failed to load ticket'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();

    if (isStaff) {
      api
        .get('/users/agents')
        .then(({ data }) => setAgents(data.data))
        .catch(() => {});
    }
  }, [fetchTicket, isStaff]);

  const applyUpdate = async (changes) => {
    setActionError('');

    try {
      const { data } = await api.patch(
        `/tickets/${id}`,
        {
          version: ticket.version,
          ...changes,
        }
      );

      setTicket({
        ...ticket,
        ...data.data,
      });

      // Refresh comments/history too
      fetchTicket();
    } catch (err) {
      if (err.response?.status === 409) {
        setActionError(
          'This ticket changed elsewhere - reloading latest version.'
        );

        fetchTicket();
      } else {
        setActionError(
          err.response?.data?.message ||
            'Update failed'
        );
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentBody.trim()) return;

    setPosting(true);

    try {
      await api.post(
        `/tickets/${id}/comments`,
        {
          body: commentBody,
          isInternal,
        }
      );

      setCommentBody('');
      setIsInternal(false);

      fetchTicket();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          'Failed to add comment'
      );
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!ticket) return null;

  const canEdit =
    isStaff ||
    (
      ticket.createdBy === user.id &&
      ticket.status === 'open'
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        ← Back
      </button>


      {/* =====================================================
          TICKET SUMMARY
      ====================================================== */}

      <section className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="p-5 sm:p-6">

          {/* Header */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">

              <p className="mb-1.5 text-xs font-medium text-slate-400">
                {ticket.ticketNumber}
              </p>

              <h1 className="text-xl font-semibold text-slate-900">
                {ticket.subject}
              </h1>

            </div>


            {/* Badges */}

            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>

          </div>


          {/* Description */}

          <div className="mt-5 border-t border-slate-100 pt-5">

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {ticket.description}
            </p>

          </div>


          {/* Metadata */}

          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">

            <span>
              <span className="font-medium text-slate-500">
                Requester:
              </span>{' '}
              {ticket.creator?.name}
            </span>

            <span>
              <span className="font-medium text-slate-500">
                Assigned:
              </span>{' '}
              {ticket.agent?.name || 'Unassigned'}
            </span>

            <span>
              <span className="font-medium text-slate-500">
                Created:
              </span>{' '}
              {new Date(ticket.createdAt).toLocaleString()}
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          ACTION ERROR
      ====================================================== */}

      {actionError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}


      {/* =====================================================
          MANAGE TICKET
      ====================================================== */}

      {isStaff && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

            <h2 className="text-sm font-semibold text-slate-900">
              Manage Ticket
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Update the ticket status, priority, or assignment.
            </p>

          </div>


          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">

            {/* Status */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Status
              </label>

              <select
                value={ticket.status}
                onChange={(e) =>
                  applyUpdate({
                    status: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>

            </div>


            {/* Priority */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Priority
              </label>

              <select
                value={ticket.priority}
                onChange={(e) =>
                  applyUpdate({
                    priority: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

            </div>


            {/* Assigned To */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Assigned to
              </label>

              <select
                value={ticket.assignedTo || ''}
                onChange={(e) =>
                  applyUpdate({
                    assignedTo:
                      e.target.value || null,
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">
                  Unassigned
                </option>

                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          COMMENTS
      ====================================================== */}

      <section className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

          <h2 className="text-sm font-semibold text-slate-900">
            Comments
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Conversation and internal notes related to this ticket.
          </p>

        </div>


        <div className="p-5 sm:p-6">

          {/* Existing comments */}

          <div className="mb-5 space-y-3">

            {ticket.comments?.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <p className="text-sm text-slate-400">
                  No comments yet.
                </p>
              </div>
            )}


            {ticket.comments?.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg border px-4 py-3 ${
                  c.isInternal
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >

                {/* Comment Header */}

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <span className="text-sm font-semibold text-slate-800">

                    {c.author?.name}

                    <span className="ml-1 text-xs font-normal text-slate-400">
                      ({c.author?.role})
                    </span>

                  </span>


                  <span className="text-xs text-slate-400">
                    {new Date(
                      c.createdAt
                    ).toLocaleString()}
                  </span>

                </div>


                {/* Internal note */}

                {c.isInternal && (
                  <div className="mt-2">

                    <span className="inline-flex rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                      Internal note
                    </span>

                  </div>
                )}


                {/* Comment body */}

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {c.body}
                </p>

              </div>
            ))}

          </div>


          {/* Add Comment */}

          {canEdit && (
            <form
              onSubmit={handleCommentSubmit}
              className="border-t border-slate-100 pt-5"
            >

              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Add a comment
              </label>

              <textarea
                value={commentBody}
                onChange={(e) =>
                  setCommentBody(e.target.value)
                }
                rows={4}
                placeholder="Write your comment..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />


              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                {isStaff ? (
                  <label className="flex items-center gap-2 text-xs text-slate-500">

                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) =>
                        setIsInternal(
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    <span>
                      Internal note (not visible to requester)
                    </span>

                  </label>
                ) : (
                  <span />
                )}


                <button
                  type="submit"
                  disabled={posting}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {posting
                    ? 'Posting…'
                    : 'Post Comment'}
                </button>

              </div>

            </form>
          )}

        </div>

      </section>


      {/* =====================================================
          HISTORY
      ====================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

          <h2 className="text-sm font-semibold text-slate-900">
            History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Changes made to this ticket.
          </p>

        </div>


        <div className="p-5 sm:p-6">

          {ticket.history?.length === 0 ? (
            <p className="text-sm text-slate-400">
              No history available.
            </p>
          ) : (
            <ul className="space-y-3">

              {ticket.history?.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col gap-1 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-start sm:gap-4"
                >

                  <span className="shrink-0 text-xs text-slate-400 sm:w-36">
                    {new Date(
                      h.createdAt
                    ).toLocaleString()}
                  </span>

                  <span className="text-sm leading-5 text-slate-600">

                    <span className="font-medium text-slate-800">
                      {h.changer?.name}
                    </span>{' '}

                    changed status{' '}

                    {h.fromStatus && (
                      <>
                        from{' '}
                        <span className="font-medium text-slate-700">
                          {h.fromStatus}
                        </span>{' '}
                      </>
                    )}

                    to{' '}

                    <span className="font-medium text-slate-700">
                      {h.toStatus}
                    </span>

                    {h.note && (
                      <>
                        {' — '}
                        {h.note}
                      </>
                    )}

                  </span>

                </li>
              ))}

            </ul>
          )}

        </div>

      </section>

    </div>
  );
}
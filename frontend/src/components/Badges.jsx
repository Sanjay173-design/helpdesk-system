const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  on_hold: 'bg-slate-200 text-slate-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-300 text-slate-600',
};

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600'}`}
    >
      {priority}
    </span>
  );
}

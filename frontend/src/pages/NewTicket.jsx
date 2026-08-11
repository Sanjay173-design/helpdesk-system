import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/tickets', form);
      navigate(`/tickets/${data.data.id}`);
    } catch (err) {
      const details = err.response?.data?.errors;
      setError(
        details ? details.map((d) => d.message).join(', ') : err.response?.data?.message || 'Failed to create ticket'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">New Ticket</h1>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
          <input
            name="subject"
            required
            minLength={3}
            maxLength={200}
            value={form.subject}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={5}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category (optional)
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Billing, Technical"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2 rounded-md disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

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
        details
          ? details.map((d) => d.message).join(', ')
          : err.response?.data?.message || 'Failed to create ticket'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          New Ticket
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new support ticket and provide the details below.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white shadow-sm"
      >
        {/* Card Header */}
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Ticket Details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Tell us what you need help with.
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-5 p-5">
          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Subject
            </label>

            <input
              id="subject"
              name="subject"
              required
              minLength={3}
              maxLength={200}
              value={form.subject}
              onChange={handleChange}
              placeholder="Enter a short summary of your issue"
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your issue in detail..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Category <span className="font-normal text-gray-400">(optional)</span>
              </label>

              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Billing, Technical"
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-end border-t px-5 py-4">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
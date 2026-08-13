import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'agent',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await api.post('/users', form);

      setForm({
        name: '',
        email: '',
        password: '',
        role: 'agent',
      });

      fetchUsers();
    } catch (err) {
      const details = err.response?.data?.errors;

      setError(
        details
          ? details.map((d) => d.message).join(', ')
          : err.response?.data?.message
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u.id}`, {
      isActive: !u.isActive,
    });

    fetchUsers();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Users
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage staff accounts and user access
        </p>
      </div>

      {/* =====================================================
          ADD STAFF ACCOUNT
      ====================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Card Header */}
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Add staff account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create an account for a support agent or administrator
          </p>
        </div>

        {/* Form */}
        <div className="p-5">

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >

            {/* Name */}
            <div className="w-full sm:flex-1">
              <label
                htmlFor="user-name"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Name
              </label>

              <input
                id="user-name"
                name="name"
                placeholder="Enter name"
                required
                value={form.name}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div className="w-full sm:flex-1">
              <label
                htmlFor="user-email"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Email
              </label>

              <input
                id="user-email"
                name="email"
                type="email"
                placeholder="Enter email"
                required
                value={form.email}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role */}
            <div className="w-full sm:w-40">
              <label
                htmlFor="user-role"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Role
              </label>

              <select
                id="user-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Add */}
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Adding...' : 'Add User'}
            </button>

          </form>
        </div>
      </section>

      {/* =====================================================
          USERS TABLE
      ====================================================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Table Header */}
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage existing user accounts
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px] text-sm">

            <thead className="bg-slate-50 text-left text-slate-600">

              <tr>

                <th className="px-5 py-3 font-medium">
                  Name
                </th>

                <th className="px-5 py-3 font-medium">
                  Email
                </th>

                <th className="px-5 py-3 font-medium">
                  Role
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 font-medium">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >

                    {/* Name */}
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {u.name}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-slate-600">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700'
                            : u.role === 'agent'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.isActive
                          ? 'Active'
                          : 'Disabled'}
                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">

                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {u.isActive
                          ? 'Disable'
                          : 'Enable'}
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </section>

    </div>
  );
}
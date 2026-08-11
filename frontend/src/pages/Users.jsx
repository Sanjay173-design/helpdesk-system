import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'agent' });
      fetchUsers();
    } catch (err) {
      const details = err.response?.data?.errors;
      setError(details ? details.map((d) => d.message).join(', ') : err.response?.data?.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
    fetchUsers();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Manage Users</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Add staff account</h2>
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <input
            name="name"
            placeholder="Name"
            required
            value={form.name}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="agent">agent</option>
            <option value="admin">admin</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.isActive ? 'Active' : 'Disabled'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u)}
                    className="text-brand-600 text-xs font-medium"
                  >
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

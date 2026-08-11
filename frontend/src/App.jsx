import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TicketList from './pages/TicketList.jsx';
import NewTicket from './pages/NewTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading…</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute roles={['customer']}>
              <NewTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
      </Routes>
    </>
  );
}

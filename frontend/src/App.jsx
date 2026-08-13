import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import TicketList from './pages/TicketList.jsx';
import NewTicket from './pages/NewTicket.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Users from './pages/Users.jsx';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

export default function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  const routes = (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* =====================================================
          DASHBOARD
      ====================================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          TICKETS
      ====================================================== */}

      <Route
        path="/tickets"
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

      {/* =====================================================
          USERS
      ====================================================== */}

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            Page not found
          </div>
        }
      />

    </Routes>
  );

  /*
   * Logged-in users get the application shell:
   * Navbar + Sidebar + responsive content.
   *
   * Public authentication pages remain exactly as they are.
   */
  if (user) {
    return (
      <Layout>
        {routes}
      </Layout>
    );
  }

  return routes;
}
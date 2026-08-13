import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({
  sidebarOpen,
  onMenuClick,
  onCloseSidebar,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return (
        location.pathname === '/' ||
        location.pathname === '/dashboard'
      );
    }

    return location.pathname.startsWith(path);
  };

  /*
   * Navigation behavior:
   *
   * Desktop:
   * - Sidebar remains open when navigating.
   *
   * Mobile:
   * - Sidebar closes after navigating.
   */
  const handleNavigationClick = () => {
    if (window.innerWidth < 768) {
      onCloseSidebar();
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: '⌂',
    },
    {
      label: 'Tickets',
      path: '/tickets',
      icon: '▣',
    },
  ];

  if (user.role === 'customer') {
    navigationItems.push({
      label: 'New Ticket',
      path: '/tickets/new',
      icon: '+',
    });
  }

  if (user.role === 'admin') {
    navigationItems.push({
      label: 'Users',
      path: '/users',
      icon: '♙',
    });
  }

  return (
    <>
      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-slate-200 bg-white">
        <div className="flex h-full items-center justify-between">

          {/* =================================================
              LEFT BRAND AREA

              OPEN  -> Blue
              CLOSED -> White
          ================================================== */}

          <div
            className={`flex h-full w-64 shrink-0 items-center px-4 transition-colors duration-200 ${
              sidebarOpen
                ? 'bg-blue-800'
                : 'bg-white'
            }`}
          >

            {/* Sidebar Toggle */}
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={
                sidebarOpen
                  ? 'Close sidebar'
                  : 'Open sidebar'
              }
              title={
                sidebarOpen
                  ? 'Close sidebar'
                  : 'Open sidebar'
              }
              className={`mr-3 flex h-9 w-9 items-center justify-center rounded-lg transition ${
                sidebarOpen
                  ? 'text-blue-100 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xl leading-none">
                ☰
              </span>
            </button>


            {/* Brand */}
            <Link
              to="/"
              onClick={handleNavigationClick}
              className="flex items-center gap-3"
            >

              {/* Logo */}
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition ${
                  sidebarOpen
                    ? 'bg-white/15 text-white'
                    : 'bg-blue-600 text-white shadow-sm'
                }`}
              >
                H
              </div>


              {/* Brand Text */}
              <div>

                <p
                  className={`text-sm font-bold leading-none transition ${
                    sidebarOpen
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  Helpdesk
                </p>

                <p
                  className={`mt-1 hidden text-[11px] transition sm:block ${
                    sidebarOpen
                      ? 'text-blue-200'
                      : 'text-slate-400'
                  }`}
                >
                  Support Management
                </p>

              </div>

            </Link>

          </div>


          {/* =================================================
              RIGHT NAVBAR AREA
              Always White
          ================================================== */}

          <div className="flex h-full flex-1 items-center justify-end bg-white px-4 sm:px-6">

            {/* User */}
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-semibold text-slate-800">
                  {user.name}
                </p>

                <p className="text-xs capitalize text-slate-400">
                  {user.role}
                </p>

              </div>

            </Link>


            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="ml-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Logout
            </button>

          </div>

        </div>
      </header>


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 w-64 bg-blue-800 shadow-xl transition-transform duration-200 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        <div className="flex h-full flex-col">


          {/* =================================================
              WORKSPACE
          ================================================== */}

          {/* <div className="border-b border-blue-700/70 px-5 py-5">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
              Workspace
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                H
              </div>

              <div>

                <p className="text-sm font-semibold text-white">
                  Helpdesk
                </p>

                <p className="text-xs capitalize text-blue-200">
                  {user.role} Workspace
                </p>

              </div>

            </div>

          </div> */}


          {/* =================================================
              MAIN MENU
          ================================================== */}

          <nav className="flex-1 px-3 py-5">

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
              Main Menu
            </p>

            <div className="space-y-1">

              {navigationItems.map((item) => {

                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigationClick}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-blue-50 hover:bg-white/10 hover:text-white'
                    }`}
                  >

                    {/* Icon */}
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-base ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'bg-blue-700 text-blue-100 group-hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                    </span>


                    {/* Label */}
                    <span>
                      {item.label}
                    </span>


                    {/* Active indicator */}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}

                  </Link>
                );

              })}

            </div>


            {/* =================================================
                ACCOUNT
            ================================================== */}

            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
              Account
            </p>


            <Link
              to="/profile"
              onClick={handleNavigationClick}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive('/profile')
                  ? 'bg-white/15 text-white'
                  : 'text-blue-50 hover:bg-white/10 hover:text-white'
              }`}
            >

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                  isActive('/profile')
                    ? 'bg-white/10 text-white'
                    : 'bg-blue-700 text-blue-100 group-hover:bg-white/10'
                }`}
              >
                ◉
              </span>


              <span>
                Profile
              </span>


              {isActive('/profile') && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}

            </Link>

          </nav>


          {/* =================================================
              USER FOOTER
          ================================================== */}

          <div className="border-t border-blue-700/70 p-4">

            <Link
              to="/profile"
              onClick={handleNavigationClick}
              className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/10"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>


              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>

                <p className="truncate text-xs capitalize text-blue-200">
                  {user.role}
                </p>

              </div>

            </Link>

          </div>

        </div>

      </aside>
    </>
  );
}
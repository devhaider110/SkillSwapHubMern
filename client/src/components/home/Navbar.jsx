import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Moon,
  Sun,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Zap,
  Video,
  MessageCircle,
  MoreHorizontal,
  Home,
  Compass,
  ShoppingBag,
  ShieldCheck,
  FileText,
  File,
  TrendingUp,
  Bell,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // =========================================================
  // THEME
  // =========================================================

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    if (newDarkState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // =========================================================
  // MAIN NAVIGATION
  // =========================================================

  const mainLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Explore', href: '/explore', icon: <Compass className="w-4 h-4" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Chat', href: '/chat', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  // =========================================================
  // MORE MENU
  // =========================================================

  const moreLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  if (user?.role === 'admin') {
    moreLinks.push({ name: 'Analytics', href: '/analytics' });
  }

  // =========================================================
  // USER MENU – with Progress
  // =========================================================

  const userLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: 'My Skills',
      href: '/skills',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      name: 'My Matches',
      href: '/matches',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: 'My Sessions',
      href: '/sessions',
      icon: <Video className="w-4 h-4" />,
    },
    {
      name: 'Resources',
      href: '/resources',
      icon: <File className="w-4 h-4" />,
    },
    {
      name: 'Quizzes',
      href: '/quizzes',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // =========================================================
  // CLOSE MENUS
  // =========================================================

  const closeUserDropdown = () => {
    setShowUserDropdown(false);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    setShowUserDropdown(false);
    setIsMenuOpen(false);
    setShowNotifications(false);
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full transition-colors duration-300 border-b shadow-sm bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50">

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 md:h-20">

          {/* =====================================================
              LOGO
          ===================================================== */}

          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={() => {
              setShowMoreDropdown(false);
              setShowUserDropdown(false);
              setShowNotifications(false);
            }}
          >
            <div className="flex items-center justify-center shadow-md w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-slate-800 dark:text-white sm:block">
              SkillSwap
              <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          {/* =====================================================
              DESKTOP MAIN LINKS
          ===================================================== */}

          <div className="items-center hidden gap-0.5 lg:flex xl:gap-1">

            {mainLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            {/* =================================================
                MORE DROPDOWN
            ================================================= */}

            <div className="relative">

              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden xl:inline">More</span>
              </button>

              {showMoreDropdown && (
                <div className="absolute left-0 z-50 w-48 py-1 mt-2 bg-white border shadow-xl dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setShowMoreDropdown(false)}
                      className="block px-4 py-2 text-sm transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE
          ===================================================== */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* SEARCH */}

            <Link
              to="/search"
              className="p-2 transition-colors rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* THEME */}

            <button
              onClick={toggleTheme}
              className="p-2 transition-colors rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 transition rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 overflow-y-auto bg-white border shadow-xl w-80 dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 max-h-96">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200/50 dark:border-slate-700/50">
                    <span className="font-semibold text-slate-800 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllRead();
                          closeNotifications();
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif._id}
                          className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                            !notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notif._id);
                            window.location.href = notif.link;
                          }}
                        >
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {notifications.length > 5 && (
                        <Link
                          to="/notifications"
                          className="block py-2 text-sm text-center text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          onClick={closeNotifications}
                        >
                          View all notifications
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                USER
            ================================================= */}

            {user ? (

              <div className="relative">

                {/* USER BUTTON */}

                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <img
                    src={
                      user.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || 'User'
                      )}&background=6366f1&color=fff&size=32`
                    }
                    alt={user.name || 'User'}
                    className="object-cover w-8 h-8 rounded-full"
                  />
                  <span className="hidden text-xs font-medium text-slate-700 dark:text-slate-300 sm:inline">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {/* =================================================
                    USER DROPDOWN
                ================================================= */}

                {showUserDropdown && (

                  <div className="absolute right-0 z-50 w-64 py-1 mt-2 overflow-hidden bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">

                    {/* USER INFORMATION */}

                    <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        @{user.username}
                      </p>
                    </div>

                    {/* NORMAL USER LINKS */}

                    {userLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={closeUserDropdown}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    ))}

                    {/* =================================================
                        ADMIN DASHBOARD
                        ONLY VISIBLE TO ADMIN
                    ================================================= */}

                    {user?.role === 'admin' && (
                      <>
                        <div className="my-1 border-t border-slate-200/70 dark:border-slate-700/70" />
                        <Link
                          to="/admin"
                          onClick={closeUserDropdown}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}

                    {/* LOGOUT */}

                    <div className="mt-1 border-t border-slate-200/50 dark:border-slate-700/50" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-left transition text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>

                  </div>
                )}
              </div>

            ) : (

              /* =================================================
                  GUEST BUTTONS
              ================================================= */

              <div className="items-center hidden gap-2 sm:flex">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 transition-colors rounded-lg lg:hidden text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

      </div>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}
{/* =========================================================
    MOBILE DRAWER
========================================================= */}

<div
  className={`fixed top-0 right-0 z-[60] h-screen w-[min(85vw,20rem)]
    bg-white/95 dark:bg-slate-900/95
    backdrop-blur-xl
    shadow-2xl
    border-l border-gray-200/50 dark:border-slate-700/50
    transform transition-transform duration-300 ease-in-out
    lg:hidden
    ${
      isMenuOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
>
  {/* Drawer container */}
  <div className="flex flex-col h-full">

    {/* =====================================================
        DRAWER HEADER
    ===================================================== */}
    <div className="flex items-center justify-between flex-shrink-0 px-5 py-4 border-b border-gray-200/70 dark:border-slate-700/70">

      <Link
        to="/"
        onClick={closeMobileMenu}
        className="flex items-center gap-2"
      >
        <div className="flex items-center justify-center shadow-md w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400">
          <span className="text-lg font-bold text-white">
            S
          </span>
        </div>

        <span className="text-lg font-bold text-slate-800 dark:text-white">
          SkillSwap
          <span className="text-indigo-600 dark:text-indigo-400">
            Hub
          </span>
        </span>
      </Link>

      <button
        onClick={closeMobileMenu}
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

    {/* =====================================================
        SCROLLABLE CONTENT
    ===================================================== */}
    <div className="flex-1 min-h-0 px-4 py-4 overflow-y-auto overscroll-contain">

      {/* ===================================================
          MAIN NAVIGATION
      =================================================== */}
      <div className="space-y-1">

        {mainLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 text-base font-medium transition rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 dark:active:bg-indigo-900/30"
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}

      </div>

      {/* ===================================================
          MORE LINKS
      =================================================== */}
      <div className="pt-5 mt-5 border-t border-gray-200/70 dark:border-slate-700/70">

        <p className="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          More
        </p>

        <div className="space-y-1">

          {moreLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={closeMobileMenu}
              className="flex items-center px-4 py-3 text-base font-medium transition rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 dark:active:bg-indigo-900/30"
            >
              {link.name}
            </Link>
          ))}

        </div>
      </div>

      {/* ===================================================
          LOGGED-IN USER LINKS
      =================================================== */}
      {user && (
        <div className="pt-5 mt-5 border-t border-gray-200/70 dark:border-slate-700/70">

          <p className="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            My Account
          </p>

          <div className="space-y-1">

            {userLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium transition rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 dark:active:bg-indigo-900/30"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {/* =============================================
                ADMIN DASHBOARD
            ============================================= */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-indigo-600 transition rounded-xl dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* =============================================
                LOGOUT
            ============================================= */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-3 text-base font-medium text-left transition rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>

          </div>
        </div>
      )}

      {/* ===================================================
          GUEST LINKS
      =================================================== */}
      {!user && (
        <div className="pt-5 mt-5 border-t border-gray-200/70 dark:border-slate-700/70">

          <div className="space-y-2">

            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="block w-full px-4 py-3 text-base font-medium text-center transition rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMobileMenu}
              className="block w-full px-4 py-3 text-base font-medium text-center text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl"
            >
              Create Free Account
            </Link>

          </div>
        </div>
      )}

      {/* Bottom spacing so last item isn't touching edge */}
      <div className="h-6" />

    </div>
  </div>
</div>

{/* =========================================================
    MOBILE OVERLAY
========================================================= */}

{isMenuOpen && (
  <div
    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
    onClick={closeMobileMenu}
  />
)}
    </nav>
  );
};

export default Navbar;
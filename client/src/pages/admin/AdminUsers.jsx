import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser,
} from '../../services/api';

import {
  Search,
  Ban,
  CheckCircle,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Users,
} from 'lucide-react';


const AdminUsers = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async (
    resetPage = false
  ) => {

    setLoading(true);
    setError('');

    try {

      const currentPage = resetPage
        ? 1
        : page;

      const res = await adminGetUsers(
        currentPage,
        search
      );

      setUsers(
        res.data.users || []
      );

      setTotalPages(
        res.data.totalPages || 1
      );

      if (resetPage) {
        setPage(1);
      }

    } catch (err) {

      console.error(
        'Admin users error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to load users'
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // FETCH USERS
  // =========================================================

  useEffect(() => {
    loadUsers();
  }, [page, search]);


  // =========================================================
  // BAN / UNBAN
  // =========================================================

  const handleBanToggle = async (
    userId,
    currentStatus
  ) => {

    const action = currentStatus
      ? 'unban'
      : 'ban';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) {
      return;
    }

    try {

      await adminUpdateUser(
        userId,
        {
          isBlocked: !currentStatus,
        }
      );

      setMessage(
        currentStatus
          ? 'User unbanned successfully'
          : 'User banned successfully'
      );

      setTimeout(
        () => setMessage(''),
        3000
      );

      loadUsers();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to update user'
      );

    }
  };


  // =========================================================
  // ROLE CHANGE
  // =========================================================

  const handleRoleChange = async (
    userId,
    newRole
  ) => {

    try {

      await adminUpdateUser(
        userId,
        {
          role: newRole,
        }
      );

      setMessage(
        'User role updated successfully'
      );

      setTimeout(
        () => setMessage(''),
        3000
      );

      loadUsers();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to update role'
      );

    }
  };


  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDelete = async (
    userId
  ) => {

    const confirmed = window.confirm(
      'Permanently delete this user and all their data?'
    );

    if (!confirmed) {
      return;
    }

    try {

      await adminDeleteUser(
        userId
      );

      setMessage(
        'User deleted successfully'
      );

      setTimeout(
        () => setMessage(''),
        3000
      );

      loadUsers();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to delete user'
      );

    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading && users.length === 0) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">

        <div className="text-center">

          <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-300 rounded-full animate-spin border-t-indigo-600" />

          <p className="text-slate-500 dark:text-slate-400">
            Loading users...
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-h-screen p-4 pt-24 bg-slate-50 dark:bg-slate-900 sm:p-6 sm:pt-28">

      <div className="mx-auto max-w-7xl">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />

              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                Admin Panel
              </span>

            </div>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
              Manage Users
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage users, roles and account status.
            </p>

          </div>


          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition bg-white border shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
          >

            <ArrowLeft className="w-4 h-4" />

            Back to Admin

          </Link>

        </div>


        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {message && (

          <div className="p-4 mb-5 text-sm border rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300">
            {message}
          </div>

        )}


        {error && (

          <div className="p-4 mb-5 text-sm border rounded-xl bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300">
            {error}
          </div>

        )}


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="p-4 mb-5 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/70 dark:border-slate-700/70">

          <div className="relative">

            <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search by name, username, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full py-3 pr-4 border pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

          </div>

        </div>


        {/* =====================================================
            USERS TABLE
        ===================================================== */}

        <div className="overflow-hidden bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/70 dark:border-slate-700/70">

          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-slate-700">

            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

            <h2 className="font-semibold text-slate-800 dark:text-white">
              Platform Users
            </h2>

            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              {users.length}
            </span>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-sm">

              <thead className="bg-slate-50 dark:bg-slate-700/50">

                <tr>

                  <th className="px-5 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">
                    User
                  </th>

                  <th className="px-5 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">
                    Email
                  </th>

                  <th className="px-5 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">
                    Role
                  </th>

                  <th className="px-5 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-5 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  users.map((userItem) => (

                    <tr
                      key={userItem._id}
                      className="border-t border-slate-200/70 dark:border-slate-700/70"
                    >

                      {/* USER */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <img
                            src={
                              userItem.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                userItem.name || 'User'
                              )}&size=40`
                            }
                            alt={userItem.name}
                            className="object-cover w-10 h-10 rounded-full"
                          />

                          <div>

                            <p className="font-medium text-slate-800 dark:text-white">
                              {userItem.name}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              @{userItem.username}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {userItem.email}
                      </td>


                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <select
                          value={userItem.role}
                          onChange={(e) =>
                            handleRoleChange(
                              userItem._id,
                              e.target.value
                            )
                          }
                          className="px-3 py-2 text-sm bg-white border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        >

                          <option value="user">
                            User
                          </option>

                          <option value="mentor">
                            Mentor
                          </option>

                          <option value="admin">
                            Admin
                          </option>

                        </select>

                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            userItem.isBlocked
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {userItem.isBlocked
                            ? 'Banned'
                            : 'Active'}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              handleBanToggle(
                                userItem._id,
                                userItem.isBlocked
                              )
                            }
                            className={`p-2 rounded-lg transition ${
                              userItem.isBlocked
                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}
                            title={
                              userItem.isBlocked
                                ? 'Unban User'
                                : 'Ban User'
                            }
                          >

                            {userItem.isBlocked ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}

                          </button>


                          <button
                            onClick={() =>
                              handleDelete(
                                userItem._id
                              )
                            }
                            className="p-2 transition rounded-lg text-rose-600 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
                            title="Delete User"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-4 mt-5">

            <button
              onClick={() =>
                setPage((p) =>
                  Math.max(1, p - 1)
                )
              }
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium transition rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Previous
            </button>


            <span className="text-sm text-slate-600 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>


            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1
                  )
                )
              }
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium transition rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Next
            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminUsers;
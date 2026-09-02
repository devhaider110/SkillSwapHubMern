import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetSwaps, adminUpdateSwap } from '../../services/api';
import { Search } from 'lucide-react';

const AdminSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  const loadSwaps = async (resetPage = true) => {
    setLoading(true);
    try {
      const res = await adminGetSwaps(resetPage ? 1 : page, statusFilter);
      setSwaps(res.data.swaps);
      setTotalPages(res.data.totalPages);
      if (resetPage) setPage(1);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load swaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps();
  }, [page, statusFilter]);

  const handleStatusChange = async (swapId, newStatus) => {
    try {
      await adminUpdateSwap(swapId, newStatus);
      setMessage('Swap status updated');
      loadSwaps(false);
    } catch (error) {
      setMessage('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Swap Requests</h1>
          <Link to="/admin" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">← Back</Link>
        </div>

        {message && (
          <div className="p-3 mb-4 border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Requester</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Receiver</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Teach Skill</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Learn Skill</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {swaps.map((swap) => (
                    <tr key={swap._id} className="border-t border-slate-200/50 dark:border-slate-700/50">
                      <td className="px-4 py-3 text-slate-800 dark:text-white">
                        {swap.requesterId?.name || 'Unknown'} (@{swap.requesterId?.username || 'unknown'})
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-white">
                        {swap.receiverId?.name || 'Unknown'} (@{swap.receiverId?.username || 'unknown'})
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {swap.teachSkillId?.skillName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {swap.learnSkillId?.skillName || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(swap.status)}`}>
                          {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={swap.status}
                          onChange={(e) => handleStatusChange(swap._id, e.target.value)}
                          className="px-2 py-1 text-sm bg-white border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSwaps;
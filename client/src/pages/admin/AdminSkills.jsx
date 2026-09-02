import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetSkills, adminDeleteSkill } from '../../services/api';
import { Search, Trash2 } from 'lucide-react';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const loadSkills = async (resetPage = true) => {
    setLoading(true);
    try {
      const res = await adminGetSkills(resetPage ? 1 : page, search);
      setSkills(res.data.skills);
      setTotalPages(res.data.totalPages);
      if (resetPage) setPage(1);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [page, search]);

  const handleDelete = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await adminDeleteSkill(skillId);
      setMessage('Skill deleted');
      loadSkills(false);
    } catch (error) {
      setMessage('Failed to delete skill');
    }
  };

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Skills</h1>
          <Link to="/admin" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">← Back</Link>
        </div>

        {message && (
          <div className="p-3 mb-4 border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
            {message}
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by skill name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
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
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Skill</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Category</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Level</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">User</th>
                    <th className="px-4 py-3 font-semibold text-left text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => (
                    <tr key={skill._id} className="border-t border-slate-200/50 dark:border-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{skill.skillName}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{skill.category}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{skill.level}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {skill.userId?.name || 'Unknown'} (@{skill.userId?.username || 'unknown'})
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

export default AdminSkills;
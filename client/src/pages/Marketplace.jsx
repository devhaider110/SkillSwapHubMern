import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMarketplaceSkills } from '../services/api';
import { Search, MapPin, Star, X } from 'lucide-react';
import SwapModal from "../components/home/SwapModal"; // ✅ CORRECT PATH

const Marketplace = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    minPrice: '',
    maxPrice: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedTargetUserId, setSelectedTargetUserId] = useState(null);
  const [targetTeachSkills, setTargetTeachSkills] = useState([]);

  const handleSwapClick = (skill) => {
    setSelectedTargetUserId(skill.userId._id);
    setTargetTeachSkills([skill]);
    setShowModal(true);
  };

  const loadSkills = async (resetPage = true) => {
    setLoading(true);
    try {
      const params = { ...filters, page: resetPage ? 1 : page };
      const response = await getMarketplaceSkills(params);
      setSkills(response.data.skills || []);
      setTotalPages(response.data.totalPages || 1);
      if (resetPage) setPage(1);
    } catch (error) {
      console.error('Failed to load skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills(true);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      loadSkills(false);
    }
  };
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      loadSkills(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">
          Skill Marketplace
        </h1>

        <div className="p-4 mb-6 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search skills..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full py-2 pl-10 pr-4 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-40 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-28"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-28"
            />
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-4 py-2 transition bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-white shadow dark:bg-slate-800 rounded-2xl animate-pulse">
                <div className="w-8 h-8 mb-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="w-3/4 h-4 mb-2 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="w-1/2 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {skills.length === 0 ? (
                <div className="py-10 text-center col-span-full text-slate-500 dark:text-slate-400">
                  No skills found matching your filters.
                </div>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill._id}
                    className="p-5 transition bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={skill.userId?.profilePic || `https://ui-avatars.com/api/?name=${skill.userId?.name || 'User'}&background=6366f1&color=fff&size=40`}
                        alt={skill.userId?.name || 'User'}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {skill.userId?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{skill.userId?.rating || 'New'}</span>
                          <span className="mx-1">•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{skill.userId?.location || 'Anywhere'}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {skill.skillName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {skill.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 text-xs text-indigo-700 bg-indigo-100 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
                        {skill.level}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {skill.category}
                      </span>
                      {skill.price > 0 ? (
                        <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">
                          ₹{skill.price}
                        </span>
                      ) : (
                        <span className="ml-auto text-xs text-emerald-500">Free</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/profile/${skill.userId?.username || ''}`}
                        className="flex-1 px-3 py-2 text-sm font-medium text-center text-indigo-600 transition border border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleSwapClick(skill)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl"
                      >
                        Request Swap
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-4 py-2 transition rounded-xl bg-slate-200 dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 transition rounded-xl bg-slate-200 dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <SwapModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          targetUserId={selectedTargetUserId}
          targetTeachSkills={targetTeachSkills}
        />
      )}
    </div>
  );
};

export default Marketplace;
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, User, Code, TrendingUp, Clock, X } from 'lucide-react';
import { globalSearch, getTrendingSkills } from '../services/api';
import { debounce } from 'lodash';

// Recent searches from localStorage
const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  } catch {
    return [];
  }
};

const addRecentSearch = (term) => {
  if (!term || term.trim().length < 2) return;
  let recent = getRecentSearches();
  recent = recent.filter((item) => item.toLowerCase() !== term.toLowerCase());
  recent.unshift(term);
  if (recent.length > 10) recent.pop();
  localStorage.setItem('recentSearches', JSON.stringify(recent));
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState({ users: [], skills: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Fetch trending skills on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrendingSkills();
        setTrendingSkills(res.data.trending || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  // Perform search
  const performSearch = useCallback(
    debounce(async (term, searchType) => {
      if (!term || term.trim().length < 2) {
        setResults({ users: [], skills: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await globalSearch(term, searchType);
        setResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
        setResults({ users: [], skills: [] });
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  // Trigger search when query or type changes
  useEffect(() => {
    if (query) {
      performSearch(query, type);
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    } else {
      setResults({ users: [], skills: [] });
    }
  }, [query, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term || term.length < 2) return;
    addRecentSearch(term);
    setRecentSearches(getRecentSearches());
    setSearchParams({ q: term, type });
    setShowAutocomplete(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowAutocomplete(true);
    if (val.trim().length >= 2) {
      performSearch(val, type);
    } else {
      setResults({ users: [], skills: [] });
    }
  };

  const handleTypeChange = (newType) => {
    setSearchParams({ q: searchTerm, type: newType });
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults({ users: [], skills: [] });
    setSearchParams({});
    setShowAutocomplete(false);
  };

  const totalResults = results.users.length + results.skills.length;

  return (
    <div className="min-h-screen p-4 pt-24 md:p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <form onSubmit={handleSearch} className="relative flex items-center overflow-hidden bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="pl-5 text-slate-400 dark:text-slate-500">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              placeholder="Search for skills, users, topics..."
              className="w-full px-4 py-4 text-base bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 mr-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions */}
          {showAutocomplete && searchTerm.trim().length >= 2 && (results.skills.length > 0 || results.users.length > 0) && (
            <div className="absolute z-10 w-full mt-2 overflow-y-auto bg-white border shadow-2xl dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 max-h-72">
              {results.skills.slice(0, 5).map((skill) => (
                <button
                  key={skill._id}
                  onClick={() => {
                    setSearchTerm(skill.skillName);
                    setSearchParams({ q: skill.skillName, type });
                    setShowAutocomplete(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>{skill.skillName}</span>
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    {skill.userId?.name || 'Skill'}
                  </span>
                </button>
              ))}
              {results.users.slice(0, 5).map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSearchTerm(user.name);
                    setSearchParams({ q: user.name, type });
                    setShowAutocomplete(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>{user.name}</span>
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    @{user.username}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trending & Recent */}
        {!searchTerm && (
          <div className="mt-6 space-y-4">
            {trendingSkills.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <TrendingUp className="w-4 h-4" /> Trending Skills
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {trendingSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSearchTerm(skill);
                        setSearchParams({ q: skill, type });
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" /> Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recentSearches.slice(0, 6).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSearchTerm(item);
                        setSearchParams({ q: item, type });
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div className="mt-6">
            {/* Tabs */}
            <div className="flex gap-2 pb-2 mb-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleTypeChange('all')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                  type === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => handleTypeChange('users')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                  type === 'users'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Users ({results.users.length})
              </button>
              <button
                onClick={() => handleTypeChange('skills')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                  type === 'skills'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Skills ({results.skills.length})
              </button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400">Searching...</div>
            ) : totalResults === 0 ? (
              <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <div className="space-y-6">
                {/* Users */}
                {(type === 'all' || type === 'users') && results.users.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-white">Users</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {results.users.map((user) => (
                        <Link
                          key={user._id}
                          to={`/profile/${user.username}`}
                          className="flex items-center gap-3 p-3 transition bg-white border dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                        >
                          <img
                            src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=40`}
                            alt={user.name}
                            className="object-cover w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                            {user.college && <p className="text-xs text-slate-400">{user.college}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {(type === 'all' || type === 'skills') && results.skills.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-white">Skills</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {results.skills.map((skill) => (
                        <Link
                          key={skill._id}
                          to={`/profile/${skill.userId?.username}`}
                          className="flex items-center gap-3 p-3 transition bg-white border dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                        >
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                            {skill.skillName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{skill.skillName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {skill.category} • {skill.level}
                            </p>
                            <p className="text-xs text-slate-400">by {skill.userId?.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
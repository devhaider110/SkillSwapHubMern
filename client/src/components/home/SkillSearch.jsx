import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, X } from "lucide-react";

const SkillSearch = () => {
  const navigate = useNavigate();   // ✅ Call the hook
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const trendingSkills = [
    "React",
    "Java",
    "Python",
    "UI/UX",
    "Graphic Design",
    "Photography",
    "Communication",
    "DSA",
    "Node.js",
    "MongoDB",
    "Spring Boot",
    "Machine Learning",
  ];

  const suggestions = query
    ? trendingSkills.filter((skill) =>
        skill.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // ✅ Only ONE handleSearch – navigates to search page
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold md:text-3xl text-slate-800 dark:text-white">
            🔍 What skill do you want to learn?
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search thousands of skills and find your perfect mentor
          </p>
        </div>

        <div className="relative">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center overflow-hidden transition-all duration-300 bg-white border shadow-lg dark:bg-slate-800 rounded-2xl hover:shadow-xl border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="pl-5 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 200);
              }}
              placeholder="e.g., React, Java, Python, UI/UX..."
              className="w-full px-4 py-4 text-base bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-2 mr-2 transition-colors rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Search
            </button>
          </form>

          {isFocused && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 overflow-y-auto bg-white border shadow-2xl dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 max-h-60 backdrop-blur-sm">
              {suggestions.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(skill);
                    setIsFocused(false);
                  }}
                  className="flex items-center w-full gap-3 px-5 py-3 text-sm text-left transition-colors border-b text-slate-700 dark:text-slate-200 hover:bg-indigo-50/70 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-100/50 dark:border-slate-700/50 last:border-0"
                >
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>
                    {skill}
                    {query && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        Trending
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="flex items-center gap-1 mr-1 text-sm text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4" />
            Trending:
          </span>
          {trendingSkills.slice(0, 8).map((skill, index) => (
            <button
              key={index}
              onClick={() => setQuery(skill)}
              className="px-3 py-1.5 text-xs md:text-sm rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/30 dark:border-slate-700/30 transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillSearch;
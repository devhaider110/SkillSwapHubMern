import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../services/api';
import { Star, MapPin, Zap } from 'lucide-react';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await getRecommendations();
        if (response.data.recommendations) {
          setRecommendations(response.data.recommendations);
        } else {
          setMessage(response.data.message || 'No recommendations yet.');
        }
      } catch (error) {
        console.error(error);
        setMessage('Failed to load recommendations. Please make sure you have added teach and learn skills.');
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  const handleSwapClick = () => {
    alert('Swap request feature is being integrated. Please use the Marketplace to request swaps.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-white">
          🎯 Your Perfect Matches
        </h1>
        <p className="mb-6 text-slate-500 dark:text-slate-400">
          People who want what you teach, and teach what you want to learn.
        </p>

        {message && (
          <div className="px-4 py-3 mb-4 text-yellow-800 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-200 rounded-xl">
            {message}
          </div>
        )}

        {recommendations.length === 0 && !message && (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">
            No recommendations found. Try adding more skills to your profile.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((item) => (
            <div
              key={item.user._id}
              className="p-6 transition bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.user.profilePic || `https://ui-avatars.com/api/?name=${item.user.name}&background=6366f1&color=fff&size=40`}
                  alt={item.user.name}
                  className="object-cover w-12 h-12 border-2 border-indigo-200 rounded-full dark:border-indigo-800"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {item.user.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{item.user.rating || 'New'}</span>
                    <span className="mx-1">•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{item.user.location || 'Anywhere'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {item.matchPercentage}%
                </span>
                <span className="px-2 py-1 text-xs text-indigo-700 bg-indigo-100 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
                  Match
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">They Teach:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.matchedTeachSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                        {skill.skillName} {skill.level && `(${skill.level})`}
                      </span>
                    ))}
                    {item.matchedTeachSkills.length > 3 && (
                      <span className="text-xs text-slate-400">+{item.matchedTeachSkills.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">They Want to Learn:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.matchedLearnSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs">
                        {skill.skillName} {skill.currentLevel && `(${skill.currentLevel})`}
                      </span>
                    ))}
                    {item.matchedLearnSkills.length > 3 && (
                      <span className="text-xs text-slate-400">+{item.matchedLearnSkills.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  to={`/profile/${item.user.username}`}
                  className="flex-1 px-3 py-2 text-sm font-medium text-center text-indigo-600 transition border border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleSwapClick}
                  className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm font-medium text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl"
                >
                  <Zap className="w-4 h-4" /> Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
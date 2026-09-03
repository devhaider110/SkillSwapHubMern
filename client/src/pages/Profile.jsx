import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadProfilePic, getPublicProfile } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrCreateConversation } from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  // State for own profile edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    college: '',
    company: '',
    city: '',
    country: '',
    github: '',
    linkedin: '',
    website: '',
    profilePic: '',
  });

  // State for public profile (other user)
  const [publicUser, setPublicUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Determine if viewing own profile
  const isOwnProfile = !username || username === user?.username;

  // Fetch public profile if viewing other user
  useEffect(() => {
    if (!isOwnProfile && username) {
      const fetchPublicProfile = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await getPublicProfile(username);
          if (res.data.success && res.data.user) {
            setPublicUser(res.data.user);
          } else {
            setError('User not found');
          }
        } catch (err) {
          console.error('Public profile fetch error:', err);
          setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      };
      fetchPublicProfile();
    }
  }, [username, isOwnProfile]);

  // Load own user data when editing own profile
  useEffect(() => {
    if (isOwnProfile && user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        college: user.college || '',
        company: user.company || '',
        city: user.city || '',
        country: user.country || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
        profilePic: user.profilePic || '',
      });
    }
  }, [isOwnProfile, user]);

  // Own profile handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const response = await uploadProfilePic(file);
      if (setUser) {
        setUser({ ...user, profilePic: response.data.profilePic });
      }
      setFormData({ ...formData, profilePic: response.data.profilePic });
      setMessage('Profile picture updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await updateProfile(formData);
      setMessage('Profile updated successfully!');
      if (setUser) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Start chat with the public user
  const handleStartChat = async () => {
    if (!publicUser) return;
    try {
      const res = await getOrCreateConversation(publicUser._id);
      navigate('/chat', { state: { conversation: res.data.conversation } });
    } catch (error) {
      console.error('Failed to start chat:', error);
      setError('Could not start conversation');
    }
  };

  // ============================================================
  // RENDER: Public profile (other user)
  // ============================================================

  if (!isOwnProfile) {
    // Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full animate-spin border-slate-200 border-t-indigo-600" />
            <p className="text-sm text-slate-600 dark:text-slate-300">Loading profile...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Not Found</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Public profile data loaded
    if (publicUser) {
      return (
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-6 mb-6">
                <img
                  src={
                    publicUser.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      publicUser.name || 'User'
                    )}&background=6366f1&color=fff&size=100`
                  }
                  alt={publicUser.name}
                  className="object-cover w-24 h-24 border-4 border-indigo-200 rounded-full dark:border-indigo-800"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {publicUser.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    @{publicUser.username}
                  </p>
                  {publicUser.bio && (
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{publicUser.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                {publicUser.college && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">College</p>
                    <p className="text-slate-800 dark:text-white">{publicUser.college}</p>
                  </div>
                )}
                {publicUser.company && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Company</p>
                    <p className="text-slate-800 dark:text-white">{publicUser.company}</p>
                  </div>
                )}
                {publicUser.city && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">City</p>
                    <p className="text-slate-800 dark:text-white">{publicUser.city}</p>
                  </div>
                )}
                {publicUser.country && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Country</p>
                    <p className="text-slate-800 dark:text-white">{publicUser.country}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleStartChat}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
                >
                  Send Message
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // fallback (should not happen)
    return null;
  }

  // ============================================================
  // RENDER: Own profile edit form
  // ============================================================

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="p-8 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">
            Edit Profile
          </h1>

          {message && (
            <div className="px-4 py-3 mb-4 border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              {message}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 mb-4 border bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <img
                src={
                  formData.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    formData.name || 'User'
                  )}&background=6366f1&color=fff&size=100`
                }
                alt="Profile"
                className="object-cover w-24 h-24 border-4 border-indigo-200 rounded-full dark:border-indigo-800"
              />
              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1.5 cursor-pointer shadow-md transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {formData.name || 'Your Name'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{formData.username || 'username'}
              </p>
              {uploading && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Uploading...
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  GitHub
                </label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  LinkedIn
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
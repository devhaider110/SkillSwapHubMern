import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Plus, X, Trash2, Edit, User, Tag } from 'lucide-react';
import { createPost, getPosts, toggleLikePost, deletePost } from '../services/api';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts();
      setPosts(res.data.posts || []);
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createPost({ ...newPost, tags });
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', tags: '' });
      fetchPosts();
    } catch (err) {
      setError('Failed to create post.');
    }
  };

  const handleLike = async (postId) => {
    try {
      await toggleLikePost(postId);
      fetchPosts(); // refresh to get updated like count
    } catch (err) {
      setError('Failed to like post.');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(postId);
      fetchPosts();
    } catch (err) {
      setError('Failed to delete post.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full animate-spin border-t-indigo-600 border-slate-200" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Community</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Discuss, share, and learn together.</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition bg-indigo-600 shadow hover:bg-indigo-700 rounded-xl"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm border text-rose-700 bg-rose-50 border-rose-200 rounded-xl dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="p-12 text-center bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <MessageCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No posts yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-5 transition bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <Link to={`/community/post/${post._id}`} className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author?.name || 'Unknown'}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {post.content}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                  {(post.author?._id === user?._id || user?.role === 'admin') && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1 transition ${
                      post.likes?.includes(user?._id)
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'hover:text-rose-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" /> {post.likes?.length || 0}
                  </button>
                  <Link to={`/community/post/${post._id}`} className="flex items-center gap-1 hover:text-indigo-600">
                    <MessageCircle className="w-4 h-4" /> {post.commentCount || 0}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <textarea
                rows="5"
                placeholder="Write your post content..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                required
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Tags (comma separated, e.g., react, nodejs)"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                >
                  Publish Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
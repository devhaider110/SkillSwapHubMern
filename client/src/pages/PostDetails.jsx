import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPost, addComment, deleteComment, toggleLikePost, toggleLikeComment, deletePost } from '../services/api';
import { Heart, MessageCircle, Trash2, ArrowLeft, User, Send } from 'lucide-react';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const fetchPost = async () => {
    try {
      const res = await getPost(id);
      setPost(res.data.post);
      setComments(res.data.comments || []);
    } catch (err) {
      setError('Post not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLikePost = async () => {
    try {
      await toggleLikePost(id);
      fetchPost();
    } catch (err) {
      setError('Failed to like post.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      await addComment(id, { content: commentContent });
      setCommentContent('');
      fetchPost();
    } catch (err) {
      setError('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      fetchPost();
    } catch (err) {
      setError('Failed to delete comment.');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await toggleLikeComment(commentId);
      fetchPost();
    } catch (err) {
      setError('Failed to like comment.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      navigate('/community');
    } catch (err) {
      setError('Failed to delete post.');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-rose-500">{error}</div>;
  if (!post) return <div className="p-6 text-center">Post not found.</div>;

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link to="/community" className="inline-flex items-center gap-1 mb-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>

        <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{post.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {post.author?.name || 'Unknown'}
                </span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {(post.author?._id === user?._id || user?.role === 'admin') && (
              <button
                onClick={handleDeletePost}
                className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {post.content}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={handleLikePost}
              className={`flex items-center gap-1 transition ${
                post.likes?.includes(user?._id)
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'hover:text-rose-500'
              }`}
            >
              <Heart className="w-4 h-4" /> {post.likes?.length || 0}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {comments.length}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-white">Comments ({comments.length})</h3>

          {user && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 text-white transition bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-slate-800 dark:text-white">
                          {comment.author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{comment.content}</p>
                    </div>
                    {(comment.author?._id === user?._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 transition rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center gap-1 mt-2 text-xs transition ${
                      comment.likes?.includes(user?._id)
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className="w-3 h-3" /> {comment.likes?.length || 0}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
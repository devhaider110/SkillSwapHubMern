import { useState } from 'react';
import { createReview, updateReview } from '../services/api';
import { Star, X } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, swapRequestId, onSuccess, existingReview }) => {
  const [skillRating, setSkillRating] = useState(existingReview?.skillRating || 0);
  const [communicationRating, setCommunicationRating] = useState(existingReview?.communicationRating || 0);
  const [knowledgeRating, setKnowledgeRating] = useState(existingReview?.knowledgeRating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const StarInput = ({ label, value, onChange }) => (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillRating || !communicationRating || !knowledgeRating) {
      setError('Please rate all categories');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (existingReview) {
        await updateReview(existingReview._id, { skillRating, communicationRating, knowledgeRating, comment });
      } else {
        await createReview({ swapRequestId, skillRating, communicationRating, knowledgeRating, comment });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 mx-4 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {existingReview ? 'Edit Your Review' : 'Rate Your Swap'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm border bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <StarInput label="Skill Rating" value={skillRating} onChange={setSkillRating} />
          <StarInput label="Communication Rating" value={communicationRating} onChange={setCommunicationRating} />
          <StarInput label="Knowledge Rating" value={knowledgeRating} onChange={setKnowledgeRating} />

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Share your experience..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
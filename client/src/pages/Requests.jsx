import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  getMyReviews,
} from '../services/api';
import ReviewModal from '../components/ReviewModal';

const Requests = () => {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSwapRequestId, setSelectedSwapRequestId] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const loadRequests = async () => {
    try {
      const [incRes, outRes] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests(),
      ]);
      setIncoming(incRes.data.requests);
      setOutgoing(outRes.data.requests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Check if user already reviewed this swap
  const checkExistingReview = async (swapId) => {
    try {
      const res = await getMyReviews();
      const existing = res.data.reviews.find((r) => r.swapRequestId === swapId);
      return existing || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Handle review button click
  const handleReviewClick = async (swapId) => {
    const existing = await checkExistingReview(swapId);
    setExistingReview(existing);
    setSelectedSwapRequestId(swapId);
    setShowReviewModal(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      loadRequests(); // refresh
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
  };

  if (loading) return <div className="p-6 text-center">Loading requests...</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">My Swap Requests</h1>

        {/* Incoming */}
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Incoming (Requests sent to me)</h2>
          {incoming.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No incoming requests.</p>
          ) : (
            <div className="space-y-4">
              {incoming.map((req) => (
                <div
                  key={req._id}
                  className="p-4 bg-white border shadow dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex flex-wrap items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {req.requesterId.name} wants to learn {req.learnSkillId.skillName} from you
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        They will teach {req.teachSkillId.skillName} (Level: {req.teachSkillId.level})
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'accepted')}
                            className="px-3 py-1 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                            className="px-3 py-1 text-sm text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'completed')}
                          className="px-3 py-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                        >
                          Complete
                        </button>
                      )}
                      {req.status === 'completed' && (
                        <button
                          onClick={() => handleReviewClick(req._id)}
                          className="px-3 py-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-white">Outgoing (Requests I sent)</h2>
          {outgoing.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No outgoing requests.</p>
          ) : (
            <div className="space-y-4">
              {outgoing.map((req) => (
                <div
                  key={req._id}
                  className="p-4 bg-white border shadow dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex flex-wrap items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        You requested to learn {req.learnSkillId.skillName} from {req.receiverId.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        You will teach {req.teachSkillId.skillName} (Level: {req.teachSkillId.level})
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'cancelled')}
                          className="px-3 py-1 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded-xl"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal - Placed outside the loops */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setExistingReview(null);
          }}
          swapRequestId={selectedSwapRequestId}
          existingReview={existingReview}
          onSuccess={() => {
            alert('Review submitted successfully!');
            setShowReviewModal(false);
            setExistingReview(null);
            loadRequests(); // refresh the list
          }}
        />
      )}
    </div>
  );
};

export default Requests;
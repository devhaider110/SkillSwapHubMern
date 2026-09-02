import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getLearnSkills, createSwapRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SwapModal = ({ isOpen, onClose, targetUserId, targetTeachSkills }) => {
  const { user } = useAuth();
  const [myLearnSkills, setMyLearnSkills] = useState([]);
  const [selectedMyLearn, setSelectedMyLearn] = useState('');
  const [selectedTargetTeach, setSelectedTargetTeach] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadMyLearnSkills();
      setSelectedMyLearn('');
      setSelectedTargetTeach('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  const loadMyLearnSkills = async () => {
    try {
      const res = await getLearnSkills();
      setMyLearnSkills(res.data.skills);
    } catch (err) {
      console.error(err);
      setError('Failed to load your learning skills. Please make sure you are logged in and have added learning skills.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMyLearn || !selectedTargetTeach) {
      setError('Please select both a skill you want to learn and the skill they will teach.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Find the actual skill ID from the list, or use the input value as skillName
      const myLearnSkill = myLearnSkills.find(s => s._id === selectedMyLearn || s.skillName === selectedMyLearn);
      const targetTeachSkill = targetTeachSkills.find(s => s._id === selectedTargetTeach || s.skillName === selectedTargetTeach);

      if (!myLearnSkill || !targetTeachSkill) {
        setError('Please select valid skills from the list.');
        setLoading(false);
        return;
      }

      const payload = {
        receiverId: targetUserId,
        teachSkillId: targetTeachSkill._id,
        learnSkillId: myLearnSkill._id,
      };
      await createSwapRequest(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 mx-4 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Request Swap</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm border bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-2 mb-4 text-sm border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
            Request sent successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              You want to learn (your goal)
            </label>
            <input
              type="text"
              list="myLearnSkillsList"
              value={selectedMyLearn}
              onChange={(e) => setSelectedMyLearn(e.target.value)}
              placeholder="Type or select a skill you want to learn..."
              className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <datalist id="myLearnSkillsList">
              {myLearnSkills.map((skill) => (
                <option key={skill._id} value={skill.skillName}>
                  {skill.skillName} ({skill.currentLevel})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              They will teach (select their skill)
            </label>
            <input
              type="text"
              list="targetTeachSkillsList"
              value={selectedTargetTeach}
              onChange={(e) => setSelectedTargetTeach(e.target.value)}
              placeholder="Type or select a skill they offer..."
              className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <datalist id="targetTeachSkillsList">
              {targetTeachSkills.map((skill) => (
                <option key={skill._id} value={skill.skillName}>
                  {skill.skillName} ({skill.level})
                </option>
              ))}
            </datalist>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Swap Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwapModal;
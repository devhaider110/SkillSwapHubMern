import { useNavigate } from 'react-router-dom';


import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getTeachSkills,
  getLearnSkills,
  addTeachSkill,
  addLearnSkill,
  updateTeachSkill,
  updateLearnSkill,
  deleteTeachSkill,
  deleteLearnSkill,
} from '../services/api';

const MySkills = () => {
  const { user } = useAuth();
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeachForm, setShowTeachForm] = useState(false);
  const [showLearnForm, setShowLearnForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    level: 'Intermediate',
    experience: '',
    description: '',
    availability: 'Flexible',
    price: 0,
    tags: '',
    priority: 'Medium',
    currentLevel: 'Beginner',
    goal: '',
    deadline: '',
  });

  // Load skills
  const loadSkills = async () => {
    try {
      const [teachRes, learnRes] = await Promise.all([
        getTeachSkills(),
        getLearnSkills(),
      ]);
      setTeachSkills(teachRes.data.skills);
      setLearnSkills(learnRes.data.skills);
    } catch (error) {
      console.error('Failed to load skills', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const navigate = useNavigate();

const handleSearch = (e) => {
  e.preventDefault();
  if (query.trim()) {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }
};

  const resetForm = () => {
    setFormData({
      skillName: '',
      category: '',
      level: 'Intermediate',
      experience: '',
      description: '',
      availability: 'Flexible',
      price: 0,
      tags: '',
      priority: 'Medium',
      currentLevel: 'Beginner',
      goal: '',
      deadline: '',
    });
    setEditing(null);
    setShowTeachForm(false);
    setShowLearnForm(false);
  };

  // Teach Skill Submit
  const handleTeachSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
      };
      if (editing && editing.type === 'teach') {
        await updateTeachSkill(editing.id, payload);
      } else {
        await addTeachSkill(payload);
      }
      resetForm();
      loadSkills();
    } catch (error) {
      console.error(error);
      alert('Failed to save teach skill');
    }
  };

  // Learn Skill Submit
  const handleLearnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && editing.type === 'learn') {
        await updateLearnSkill(editing.id, formData);
      } else {
        await addLearnSkill(formData);
      }
      resetForm();
      loadSkills();
    } catch (error) {
      console.error(error);
      alert('Failed to save learn skill');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (type === 'teach') await deleteTeachSkill(id);
      else await deleteLearnSkill(id);
      loadSkills();
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  };

  const editTeach = (skill) => {
    setEditing({ type: 'teach', id: skill._id });
    setFormData({
      skillName: skill.skillName,
      category: skill.category,
      level: skill.level,
      experience: skill.experience || '',
      description: skill.description || '',
      availability: skill.availability,
      price: skill.price || 0,
      tags: skill.tags?.join(', ') || '',
      priority: 'Medium',
      currentLevel: 'Beginner',
      goal: '',
      deadline: '',
    });
    setShowTeachForm(true);
    setShowLearnForm(false);
  };

  const editLearn = (skill) => {
    setEditing({ type: 'learn', id: skill._id });
    setFormData({
      skillName: skill.skillName,
      category: skill.category,
      priority: skill.priority,
      currentLevel: skill.currentLevel,
      goal: skill.goal || '',
      deadline: skill.deadline ? skill.deadline.split('T')[0] : '',
      level: 'Intermediate',
      experience: '',
      description: '',
      availability: 'Flexible',
      price: 0,
      tags: '',
    });
    setShowLearnForm(true);
    setShowTeachForm(false);
  };

  if (loading) return <div className="p-6 text-center">Loading skills...</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">My Skills</h1>

        {/* Teach Skills Section */}
        <div className="p-6 mb-6 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">I Teach</h2>
            <button
              onClick={() => { resetForm(); setShowTeachForm(!showTeachForm); }}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              {showTeachForm ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showTeachForm && (
            <form onSubmit={handleTeachSubmit} className="grid grid-cols-1 gap-4 p-4 mb-4 md:grid-cols-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <input name="skillName" value={formData.skillName} onChange={handleChange} placeholder="Skill Name*" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
              <input name="category" value={formData.category} onChange={handleChange} placeholder="Category*" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
              <select name="level" value={formData.level} onChange={handleChange} className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <input name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience (e.g., 2 years)" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows="2" className="col-span-2 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <select name="availability" value={formData.availability} onChange={handleChange} className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <option value="Flexible">Flexible</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Both">Both</option>
              </select>
              <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price (0 = free)" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="col-span-2 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <button type="submit" className="col-span-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                {editing?.type === 'teach' ? 'Update' : 'Add'} Teach Skill
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            {teachSkills.length === 0 && <p className="text-slate-500 dark:text-slate-400">No teaching skills added yet.</p>}
            {teachSkills.map(skill => (
              <div key={skill._id} className="flex items-center gap-3 px-4 py-3 border bg-slate-50 dark:bg-slate-700/50 rounded-xl border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-800 dark:text-white">{skill.skillName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({skill.level})</span>
                <button onClick={() => editTeach(skill)} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Edit</button>
                <button onClick={() => handleDelete('teach', skill._id)} className="text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400">Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Learn Skills Section */}
        <div className="p-6 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">I Want to Learn</h2>
            <button
              onClick={() => { resetForm(); setShowLearnForm(!showLearnForm); }}
              className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              {showLearnForm ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showLearnForm && (
            <form onSubmit={handleLearnSubmit} className="grid grid-cols-1 gap-4 p-4 mb-4 md:grid-cols-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <input name="skillName" value={formData.skillName} onChange={handleChange} placeholder="Skill Name*" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
              <input name="category" value={formData.category} onChange={handleChange} placeholder="Category*" className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
              <select name="priority" value={formData.priority} onChange={handleChange} className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <select name="currentLevel" value={formData.currentLevel} onChange={handleChange} className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <textarea name="goal" value={formData.goal} onChange={handleChange} placeholder="Goal (e.g., Build a full-stack app)" rows="2" className="col-span-2 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className="px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
              <button type="submit" className="col-span-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                {editing?.type === 'learn' ? 'Update' : 'Add'} Learn Skill
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            {learnSkills.length === 0 && <p className="text-slate-500 dark:text-slate-400">No learning goals added yet.</p>}
            {learnSkills.map(skill => (
              <div key={skill._id} className="flex items-center gap-3 px-4 py-3 border bg-slate-50 dark:bg-slate-700/50 rounded-xl border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-800 dark:text-white">{skill.skillName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({skill.currentLevel})</span>
                <button onClick={() => editLearn(skill)} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Edit</button>
                <button onClick={() => handleDelete('learn', skill._id)} className="text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySkills;